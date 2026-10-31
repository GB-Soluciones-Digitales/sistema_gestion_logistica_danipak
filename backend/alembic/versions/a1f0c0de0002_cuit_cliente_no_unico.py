"""cuit_cliente_no_unico

Revision ID: a1f0c0de0002
Revises: a1f0c0de0001
Create Date: 2026-10-30 10:05:00.000000

"""
from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = 'a1f0c0de0002'
down_revision: Union[str, Sequence[str], None] = 'a1f0c0de0001'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.drop_index('ix_clientes_cuit_dni', table_name='clientes')
    op.create_index('ix_clientes_cuit_dni', 'clientes', ['cuit_dni'], unique=False)


def downgrade() -> None:
    """Downgrade schema (falla si ya existen CUIT repetidos)."""
    op.drop_index('ix_clientes_cuit_dni', table_name='clientes')
    op.create_index('ix_clientes_cuit_dni', 'clientes', ['cuit_dni'], unique=True)
