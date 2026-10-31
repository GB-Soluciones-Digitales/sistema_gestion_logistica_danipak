"""crea_tabla_pagos_facturas

Revision ID: a1f0c0de0004
Revises: a1f0c0de0003
Create Date: 2026-10-30 10:20:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a1f0c0de0004'
down_revision: Union[str, Sequence[str], None] = 'a1f0c0de0003'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        'pagos_facturas',
        sa.Column('pago_id', sa.Integer(), nullable=False),
        sa.Column('factura_id', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['factura_id'], ['facturas.id']),
        sa.ForeignKeyConstraint(['pago_id'], ['pagos.id']),
        sa.PrimaryKeyConstraint('pago_id', 'factura_id'),
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_table('pagos_facturas')
