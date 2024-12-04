use crate::config::Config;
use crate::db::company as company_store;
use crate::db::policy as policy_store;
use crate::db::user as user_store;
use sea_orm::DatabaseConnection;
use sea_orm::EntityTrait;
use sea_orm::IntoActiveModel;
use serde::Deserialize;
use std::fs;

#[derive(Deserialize, Debug)]
struct Seed {
    companies: Vec<ar_entity::company::Model>,
    ishare_users: Vec<ar_entity::ishare_user::Model>,
    policy_sets: Vec<ar_entity::policy_set::Model>,
    policies: Vec<ar_entity::policy::Model>,
}

pub async fn apply_seeds(db: &DatabaseConnection, config: &Config) {
    tracing::info!("applying seeds");
    let seed_folder = match &config.seed_folder {
        Some(folder) => {
            tracing::info!("applying seeds from location {}", &folder);
            folder
        }
        None => {
            tracing::info!("no seeds found in config");
            return;
        }
    };

    let mut files: Vec<fs::DirEntry> = fs::read_dir(seed_folder)
        .unwrap()
        .map(|x| x.unwrap())
        .collect();

    files.sort_by(|a, b| a.file_name().cmp(&b.file_name()));

    for entry in files.iter() {
        let path = entry.path();

        if entry.file_name().to_str().unwrap().contains("seed") {
            let seed: Seed = serde_json::from_slice(&fs::read(path).unwrap()).unwrap();

            for company in seed.companies.iter() {
                company_store::insert_if_not_exists(&company.id, &company.name, db)
                    .await
                    .unwrap();
            }

            for user in seed.ishare_users.iter() {
                user_store::insert_if_not_exists(
                    user.id.clone(),
                    user.email.clone(),
                    user.fullname.clone(),
                    user.company.clone(),
                    user.idp_eori.clone(),
                    user.idp_url.clone(),
                    db,
                )
                .await
                .unwrap();
            }

            for ps in seed.policy_sets {
                match policy_store::get_policy_set_by_id(&ps.id, &db)
                    .await
                    .unwrap()
                {
                    Some(_) => {}
                    None => {
                        let active_ps = ps.into_active_model();
                        ar_entity::policy_set::Entity::insert(active_ps)
                            .exec(&*db)
                            .await
                            .unwrap();
                    }
                }
            }

            for p in seed.policies {
                match policy_store::get_policy(p.policy_set, p.id, db)
                    .await
                    .unwrap()
                {
                    Some(_) => {}
                    None => {
                        let active_p = p.into_active_model();
                        ar_entity::policy::Entity::insert(active_p)
                            .exec(&*db)
                            .await
                            .unwrap();
                    }
                }
            }
        }
    }
}
