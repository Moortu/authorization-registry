use anyhow::Context;
use ar_entity::company::ActiveModel as ActiveCompany;
use ar_entity::company::Entity as Company;
use ar_entity::company::Model as CompanyModel;
use sea_orm::{entity::*, query::*, ActiveValue, DatabaseConnection, EntityTrait};

pub async fn insert_if_not_exists<T: ConnectionTrait>(
    eori: &str,
    name: &str,
    db: &T,
) -> anyhow::Result<String> {
    let company = Company::find()
        .filter(ar_entity::company::Column::Id.eq(eori))
        .one(&*db)
        .await
        .context(format!(
            "Error retrieving company from db with eori '{}' and name '{}'",
            eori, name
        ))?;

    let company_id = match company {
        None => {
            let active_model = ActiveCompany {
                id: ActiveValue::set(eori.to_owned()),
                name: ActiveValue::set(name.to_owned()),
            };
            Company::insert(active_model)
                .exec(&*db)
                .await
                .context(format!(
                    "Error inserting company to db with eori '{}' and name '{}'",
                    eori, name
                ))?
                .last_insert_id
        }
        Some(model) => model.id,
    };

    return Ok(company_id);
}

pub async fn _get_company_by_id(
    id: &str,
    db: &DatabaseConnection,
) -> anyhow::Result<Option<CompanyModel>> {
    let company = Company::find()
        .filter(ar_entity::company::Column::Id.eq(id))
        .one(&*db)
        .await
        .context(format!("Error retrieving company from db with id '{}'", id))?;

    return Ok(company);
}
