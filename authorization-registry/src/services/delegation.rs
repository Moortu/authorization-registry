use anyhow::Context;
use ar_entity::delegation_evidence::ResourceRule;
use ishare::delegation_evidence::{
    DelegationEvidence, DelegationEvidenceContainer, DelegationTarget, PolicySetTarget,
    PolicySetTargetEnvironment, Resource, ResourceRules, ResourceTarget,
};
use ishare::delegation_request::{DelegationRequest, Policy, PolicySet};
use sea_orm::DatabaseConnection;

use crate::db::policy::{self as policy_store, DelegationEvidencePolicy, MatchingPolicySetRow};
use crate::error::AppError;
use crate::TimeProvider;

pub fn is_contained_by<T: PartialEq>(vec_a: &Vec<T>, vec_b: &Vec<T>) -> bool {
    vec_a.iter().all(|x| vec_b.contains(x))
}

pub fn star_or_contained_by(vec_a: &Vec<String>, vec_b: &Vec<String>) -> bool {
    vec_b.get(0).is_some_and(|i| i == "*") || is_contained_by(vec_a, vec_b)
}

pub fn is_matching_policy(dr_policy: &Policy, de_policy_set: &DelegationEvidencePolicy) -> bool {
    return star_or_contained_by(
        &dr_policy.target.resource.identifiers,
        &de_policy_set.identifiers,
    ) && star_or_contained_by(
        &dr_policy.target.resource.attributes,
        &de_policy_set.attributes,
    ) && star_or_contained_by(&dr_policy.target.actions, &de_policy_set.actions)
        && dr_policy.target.resource.resource_type == de_policy_set.resource_type
        && is_contained_by(
            &dr_policy.target.environment.service_providers,
            &de_policy_set.service_providers,
        );
}

pub fn mask_matching_policy_sets<'a>(
    policy_set: &PolicySet,
    de_policy_sets: &'a Vec<MatchingPolicySetRow>,
) -> Vec<&'a MatchingPolicySetRow> {
    let filtered: Vec<&MatchingPolicySetRow> = de_policy_sets
        .into_iter()
        .filter(|ps| {
            policy_set
                .policies
                .iter()
                .all(|p1| ps.policies.iter().any(|p2| is_matching_policy(p1, p2)))
        })
        .collect();

    filtered
}

pub async fn create_delegation_evidence(
    delegation_request: &DelegationRequest,
    time_provider: std::sync::Arc<dyn TimeProvider>,
    de_expiry_seconds: i64,
    db: &DatabaseConnection,
) -> Result<DelegationEvidenceContainer, AppError> {
    tracing::info!(
        "Retrieving policy sets for access subject '{}' and policy issuer '{}'",
        &delegation_request.target.access_subject,
        &delegation_request.policy_issuer
    );

    let de_policy_sets = policy_store::get_policy_sets_with_policies(
        Some(delegation_request.target.access_subject.to_owned()),
        Some(delegation_request.policy_issuer.to_owned()),
        &db,
    )
    .await
    .context("Error getting policy sets")?;

    let mut policy_sets = vec![];
    for ps in delegation_request.policy_sets.iter() {
        let matching_policy_sets = mask_matching_policy_sets(ps, &de_policy_sets);

        for matching in matching_policy_sets {
            let policies: Vec<ishare::delegation_evidence::Policy> = ps
                .policies
                .iter()
                .map(|p| {
                    let mut matching_policies = matching
                        .policies
                        .iter()
                        .filter(|mp| is_matching_policy(p, mp));

                    let permit = matching_policies.all(|matching_policy| {
                        matching_policy.rules.iter().all(|r| match r {
                            ResourceRule::Permit => true,
                            ResourceRule::Deny(t) => {
                                !(star_or_contained_by(
                                    &p.target.resource.identifiers,
                                    &t.target.resource.identifiers,
                                ) && star_or_contained_by(
                                    &p.target.resource.attributes,
                                    &t.target.resource.attributes,
                                ) && star_or_contained_by(&p.target.actions, &t.target.actions)
                                    && &p.target.resource.resource_type
                                        == &t.target.resource.resource_type)
                            }
                        })
                    });

                    ishare::delegation_evidence::Policy {
                        target: ResourceTarget {
                            actions: p.target.actions.clone(),
                            environment: ishare::delegation_evidence::Environment {
                                service_providers: p.target.environment.service_providers.clone(),
                            },
                            resource: Resource {
                                resource_type: p.target.resource.resource_type.clone(),
                                identifiers: p.target.resource.identifiers.clone(),
                                attributes: p.target.resource.attributes.clone(),
                            },
                        },
                        rules: vec![ResourceRules {
                            effect: if permit {
                                "Permit".to_string()
                            } else {
                                "Deny".to_string()
                            },
                        }],
                    }
                })
                .collect();

            let new_policy_set = ishare::delegation_evidence::PolicySet {
                max_delegation_depth: matching.max_delegation_depth,
                policies,
                target: PolicySetTarget {
                    environment: PolicySetTargetEnvironment {
                        licenses: matching.licenses.clone(),
                    },
                },
            };

            policy_sets.push(new_policy_set);
        }
    }

    let now = time_provider.now().timestamp();
    let de_container = DelegationEvidenceContainer {
        delegation_evidence: DelegationEvidence {
            not_before: now,
            not_on_or_after: now + de_expiry_seconds,
            policy_issuer: delegation_request.policy_issuer.clone(),
            target: DelegationTarget {
                access_subject: delegation_request.target.access_subject.clone(),
            },
            policy_sets,
        },
    };

    Ok(de_container)
}
