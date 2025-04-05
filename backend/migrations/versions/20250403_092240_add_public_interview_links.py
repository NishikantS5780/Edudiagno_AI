"""add_public_interview_links

Revision ID: 50e65bbab061
Revises: 96631c8c4c3d
Create Date: 2025-04-03 09:22:40.599974+00:00

"""
from alembic import op
import sqlalchemy as sa
from datetime import datetime


# revision identifiers, used by Alembic.
revision = '50e65bbab061'
down_revision = '96631c8c4c3d'
branch_labels = None
depends_on = None


def upgrade():
    # Create public_interview_links table
    op.create_table(
        'public_interview_links',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('job_id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('access_code', sa.String(), nullable=False),
        sa.Column('is_active', sa.Boolean(), default=True),
        sa.Column('expires_at', sa.DateTime(), nullable=True),
        sa.Column('visits', sa.Integer(), default=0),
        sa.Column('started_interviews', sa.Integer(), default=0),
        sa.Column('completed_interviews', sa.Integer(), default=0),
        sa.Column('created_at', sa.DateTime(), default=datetime.utcnow),
        sa.Column('updated_at', sa.DateTime(), default=datetime.utcnow, onupdate=datetime.utcnow),
        sa.ForeignKeyConstraint(['job_id'], ['jobs.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create indexes
    op.create_index('ix_public_interview_links_id', 'public_interview_links', ['id'])
    op.create_index('ix_public_interview_links_access_code', 'public_interview_links', ['access_code'], unique=True)
    op.create_index('ix_public_interview_links_job_id', 'public_interview_links', ['job_id'])


def downgrade():
    # Drop indexes
    op.drop_index('ix_public_interview_links_id')
    op.drop_index('ix_public_interview_links_access_code')
    op.drop_index('ix_public_interview_links_job_id')
    
    # Drop table
    op.drop_table('public_interview_links')
