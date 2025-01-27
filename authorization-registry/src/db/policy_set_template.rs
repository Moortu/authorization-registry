use anyhow::Context;
use sea_orm::{DatabaseConnection, EntityTrait};
use uuid::Uuid;

pub async fn get_all_policy_set_templates(
    db: &DatabaseConnection,
) -> anyhow::Result<Vec<ar_entity::policy_set_template::Model>> {
    let policy_set_templates = ar_entity::policy_set_template::Entity::find()
        .all(db)
        .await
        .context("Error getting policy sets from database")?;

    return Ok(policy_set_templates);
}

pub async fn get_policy_set_template_by_id(
    id: &Uuid,
    db: &DatabaseConnection,
) -> anyhow::Result<Option<ar_entity::policy_set_template::Model>> {
    let ps_template = ar_entity::policy_set_template::Entity::find_by_id(*id)
        .one(db)
        .await?;

    Ok(ps_template)
}
