import React, {
    FC,
    UIEvent,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import MaterialReactTable, { MRT_ColumnDef } from 'material-react-table';
import { Typography } from '@mui/material';
import type { ColumnFiltersState, SortingState } from '@tanstack/react-table';
import '../Components/Styles/style.css'
import type { Virtualizer } from '@tanstack/react-virtual';
import {
    QueryClient,
    QueryClientProvider,
    useInfiniteQuery,
} from '@tanstack/react-query';
import { MRT_Localization_RU } from 'material-react-table/locales/ru';


type UserApiResponse = {
    data: Array<User>;
    meta: {
        totalRowCount: number;
    };
};


type User = {
    firstName: string;
    lastName: string;
    address: string;
    state: string;
};

const columns = [
    {
        accessorKey: 'firstName',
        header: 'First Name',
    },
    {
        accessorKey: 'lastName',
        header: 'Last Name',
    },
    {
        accessorKey: 'state',
        header: 'State',
    },

];



const fetchSize = 25;

const Example: FC = () => {
 
  
    const tableContainerRef = useRef<HTMLDivElement>(null); //we can get access to the underlying TableContainer element and react to its scroll events
    const virtualizerInstanceRef =
        useRef<Virtualizer<HTMLDivElement, HTMLTableRowElement>>(null); //we can get access to the underlying Virtualizer instance and call its scrollToIndex method

    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [globalFilter, setGlobalFilter] = useState<string>();
    const [sorting, setSorting] = useState<SortingState>([]);

    const { data, fetchNextPage, isError, isFetching, isLoading } =
        useInfiniteQuery<UserApiResponse>(
            ['table-data', columnFilters, globalFilter, sorting],
            async ({ pageParam = 0 }) => {
                const url = new URL(
                    '/api/data',
                    process.env.NODE_ENV === 'production'
                        ? 'https://www.material-react-table.com'
                        : 'http://localhost:3000',
                );
                url.searchParams.set('start', `${pageParam * fetchSize}`);
                url.searchParams.set('size', `${fetchSize}`);
                url.searchParams.set('filters', JSON.stringify(columnFilters ?? []));
                url.searchParams.set('globalFilter', globalFilter ?? '');
                url.searchParams.set('sorting', JSON.stringify(sorting ?? []));

                const response = await fetch(url.href);
                const json = (await response.json()) as UserApiResponse;
                return json;
            },
            {
                getNextPageParam: (_lastGroup: any, groups: string | any[]) => groups.length,
                keepPreviousData: true,
                refetchOnWindowFocus: false,
            },
        );

    const flatData = useMemo(
        () => data?.pages.flatMap((page: { data: any; }) => page.data) ?? [],
        [data],
    );

    const totalDBRowCount = data?.pages?.[0]?.meta?.totalRowCount ?? 0;
    const totalFetched = flatData.length;

    //called on scroll and possibly on mount to fetch more data as the user scrolls and reaches bottom of table
    const fetchMoreOnBottomReached = useCallback(
        (containerRefElement?: HTMLDivElement | null) => {
            if (containerRefElement) {
                const { scrollHeight, scrollTop, clientHeight } = containerRefElement;
                //once the user has scrolled within 200px of the bottom of the table, fetch more data if we can
                if (
                    scrollHeight - scrollTop - clientHeight < 200 &&
                    !isFetching &&
                    totalFetched < totalDBRowCount
                ) {
                    fetchNextPage();
                }
            }
        },
        [fetchNextPage, isFetching, totalFetched, totalDBRowCount],
    );

    //scroll to top of table when sorting or filters change
    useEffect(() => {
        if (virtualizerInstanceRef.current) {
            virtualizerInstanceRef.current.scrollToIndex(0);
        }
    }, [sorting, columnFilters, globalFilter]);

    //a check on mount to see if the table is already scrolled to the bottom and immediately needs to fetch more data
    useEffect(() => {
        fetchMoreOnBottomReached(tableContainerRef.current);
    }, [fetchMoreOnBottomReached]);

    return (
       
        <MaterialReactTable
            columns={columns}
            data={flatData}
            enablePagination={false}
            enableRowNumbers
            enableRowVirtualization //optional, but recommended if it is likely going to be more than 100 rows
            manualFiltering
            manualSorting
            localization={MRT_Localization_RU}
            muiTableContainerProps={{
                ref: tableContainerRef, //get access to the table container element
                sx: { maxHeight: '600px' }, //give the table a max height
                onScroll: (
                    event: UIEvent<HTMLDivElement>, //add an event listener to the table container element
                ) => fetchMoreOnBottomReached(event.target as HTMLDivElement),
            }}
            muiToolbarAlertBannerProps={
                isError
                    ? {
                        color: 'error',
                        children: 'Error loading data',
                    }
                    : undefined
            }
            onColumnFiltersChange={setColumnFilters}
            onGlobalFilterChange={setGlobalFilter}
            onSortingChange={setSorting}
            renderBottomToolbarCustomActions={() => (
                <Typography>
                    Fetched {totalFetched} of {totalDBRowCount} total rows.
                </Typography>
            )}
            state={{
                columnFilters,
                globalFilter,
                isLoading,
                showAlertBanner: isError,
                showProgressBars: isFetching,
                sorting,
            }}
            virtualizerInstanceRef={virtualizerInstanceRef} //get access to the virtualizer instance
        />
    );
};

const queryClient = new QueryClient();

const ExampleWithReactQueryProvider = () => (
    <QueryClientProvider client={queryClient}>
        <>
        <div className="legalEntity">
        <h1>Юридические Лица</h1>
        </div>
        </>
        <Example />
    </QueryClientProvider>
);

export default ExampleWithReactQueryProvider;