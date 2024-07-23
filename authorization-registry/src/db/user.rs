use anyhow::Context;
use ar_entity::ishare_user::ActiveModel as ActiveUser;
use ar_entity::ishare_user::Entity as User;
use ar_entity::ishare_user::Model as UserModel;
use sea_orm::{entity::*, query::*, ActiveValue, DatabaseConnection, EntityTrait};

pub async fn insert_if_not_exists<T: ConnectionTrait>(
    idp_sub: String,
    email: String,
    fullname: String,
    company: String,
    idp_eori: String,
    idp_url: String,
    db: &T,
) -> anyhow::Result<String> {
    let user = User::find()
        .filter(ar_entity::ishare_user::Column::Id.eq(&idp_sub))
        .one(&*db)
        .await
        .context(format!(
            "Error retrieving user from db with id '{}'",
            idp_sub
        ))?;

    let user_id = match user {
        None => {
            let active_model = ActiveUser {
                id: ActiveValue::set(idp_sub),
                email: ActiveValue::set(email),
                fullname: ActiveValue::set(fullname),
                company: ActiveValue::set(company),
                idp_eori: ActiveValue::set(idp_eori),
                idp_url: ActiveValue::set(idp_url),
            };
            User::insert(active_model)
                .exec(&*db)
                .await
                .context("Error inserting user into db with")?
                .last_insert_id
        }
        Some(model) => model.id,
    };

    return Ok(user_id);
}

pub async fn _get_user_by_id(
    id: &str,
    db: &DatabaseConnection,
) -> anyhow::Result<Option<UserModel>> {
    let user = User::find()
        .filter(ar_entity::ishare_user::Column::Id.eq(id))
        .one(&*db)
        .await
        .context(format!("Error retrieving user from db with id '{}'", id))?;

    return Ok(user);
}
