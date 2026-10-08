"""crear_empresa

Revision ID: 425f60d229d6
Revises: f56a7caa32f0
Create Date: 2026-10-08 18:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '425f60d229d6'
down_revision: Union[str, Sequence[str], None] = 'f56a7caa32f0'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table('empresas',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('nombre', sa.String(), nullable=False),
        sa.Column('telefono', sa.String(), nullable=False),
        sa.Column('telefono_aux', sa.String(), nullable=True),
        sa.Column('direccion', sa.String(), nullable=False),
        sa.Column('correo', sa.String(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_empresas_id'), 'empresas', ['id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_empresas_id'), table_name='empresas')
    op.drop_table('empresas')