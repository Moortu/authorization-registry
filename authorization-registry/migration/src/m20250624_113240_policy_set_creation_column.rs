use sea_orm_migration::prelude::*;

use crate::m20220101_000001_create_table::PolicySet;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .alter_table(
                Table::alter()
                    .table(PolicySet::Table)
                    .add_column_if_not_exists(
                        ColumnDef::new(Alias::new("created"))
                            .timestamp_with_time_zone()
                            .default(Expr::current_timestamp()),
                    )
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .alter_table(
                Table::alter()
                    .table(PolicySet::Table)
                    .drop_column(Alias::new("created"))
                    .to_owned(),
            )
            .await
    }
}
