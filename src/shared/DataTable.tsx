import { Box } from '@mui/material';
import { DataGrid, type DataGridProps, type GridValidRowModel } from '@mui/x-data-grid';
import { tokens, vercelTokens } from '../theme';
import { AsyncState } from './ui';

export function DataTable<R extends GridValidRowModel>(props: DataGridProps<R>) {
    return <Box sx={{ minWidth: 0, width: '100%', overflowX: 'auto' }}>
        <DataGrid<R> autoHeight rowHeight={tokens.size.row} columnHeaderHeight={tokens.size.tableHeader}
            pageSizeOptions={[25, 50, 100]} disableColumnFilter disableRowSelectionExcludeModel disableRowSelectionOnClick
            slots={{ noRowsOverlay: () => <AsyncState empty emptyTitle="No results found" emptyDescription="Try adjusting your search or filters."/> }}
            sx={{
                bgcolor: 'background.paper', borderColor: 'divider', borderRadius: `${tokens.radius.panel}px`,
                '--DataGrid-overlayHeight': '220px', '--DataGrid-containerBackground': vercelTokens.colors.canvas,
                '& .MuiDataGrid-columnHeaderTitle': { ...vercelTokens.typography['label-sm'], color: 'text.secondary' },
                '& .MuiDataGrid-columnHeader, & .MuiDataGrid-cell': { px: 4 },
                '& .MuiDataGrid-columnSeparator': { color: 'divider' },
                '& .MuiDataGrid-cell': { ...vercelTokens.typography['body-md'], display: 'flex', alignItems: 'center', borderColor: 'divider', fontVariantNumeric: 'tabular-nums' },
                '& .MuiDataGrid-row:hover': { bgcolor: 'action.hover' },
                '& .MuiDataGrid-cell:focus-within, & .MuiDataGrid-columnHeader:focus-within': { outlineColor: 'info.main', outlineOffset: -2 },
                '& .MuiDataGrid-footerContainer': { borderColor: 'divider', minHeight: 56 },
            }} {...props}/>
    </Box>;
}
