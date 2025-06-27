use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(AuditEvent::Table)
                    .if_not_exists()
                    .col(
                        ColumnDef::new(AuditEvent::Id)
                            .uuid()
                            .not_null()
                            .primary_key(),
                    )
                    .col(
                        ColumnDef::new(AuditEvent::Timestamp)
                            .timestamp_with_time_zone()
                            .not_null(),
                    )
                    .col(ColumnDef::new(AuditEvent::EventType).text().not_null())
                    .col(ColumnDef::new(AuditEvent::Source).text())
                    .col(ColumnDef::new(AuditEvent::Context).json())
                    .col(ColumnDef::new(AuditEvent::Data).json())
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(AuditEvent::Table).to_owned())
            .await
    }
}

#[derive(DeriveIden)]
enum AuditEvent {
    Table,
    Id,
    Timestamp,
    EventType,
    Source,
    Context,
    Data,
}
