"""agrega_estado_a_facturas

Revision ID: a1f0c0de0003
Revises: a1f0c0de0002
Create Date: 2026-10-30 10:10:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a1f0c0de0003'
down_revision: Union[str, Sequence[str], None] = 'a1f0c0de0002'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema. Las facturas existentes quedan 'pendiente' (todas son de cuenta corriente)."""
    op.add_column('facturas', sa.Column('estado', sa.String(), nullable=False, server_default='pendiente'))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('facturas', 'estado')
