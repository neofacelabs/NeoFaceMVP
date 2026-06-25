"""add projects AaaS fields and waitlist entries table

Revision ID: 0004_projects_waitlist
Revises: 0003_aaas_multitenant
Create Date: 2026-06-25

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID

# revision identifiers, used by Alembic.
revision: str = '0004_projects_waitlist'
down_revision: Union[str, None] = '0003_aaas_multitenant'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Add fields to applications table
    op.add_column('applications', sa.Column('allowed_origins', sa.JSON(), nullable=True))
    op.add_column('applications', sa.Column('allowed_domains', sa.JSON(), nullable=True))
    op.add_column('applications', sa.Column('webhook_url', sa.String(length=255), nullable=True))
    op.add_column('applications', sa.Column('rate_limit', sa.Integer(), nullable=False, server_default='100'))

    # 2. Create waitlist_entries table
    op.create_table(
        'waitlist_entries',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('feature', sa.String(length=100), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()'))
    )


def downgrade() -> None:
    # 1. Drop waitlist_entries table
    op.drop_table('waitlist_entries')

    # 2. Drop fields from applications table
    op.drop_column('applications', 'rate_limit')
    op.drop_column('applications', 'webhook_url')
    op.drop_column('applications', 'allowed_domains')
    op.drop_column('applications', 'allowed_origins')
