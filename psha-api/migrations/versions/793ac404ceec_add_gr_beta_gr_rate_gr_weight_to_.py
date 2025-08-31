"""add gr_beta, gr_rate, gr_weight to datasources

Revision ID: 793ac404ceec
Revises: 
Create Date: 2025-08-22 13:00:57.166284
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '793ac404ceec'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Kolom sudah ada, jadi tidak perlu buat lagi
    pass



def downgrade() -> None:
    """Downgrade schema: remove new columns from datasources"""
    op.drop_column('datasources', 'gr_weight')
    op.drop_column('datasources', 'gr_rate')
    op.drop_column('datasources', 'gr_beta')
