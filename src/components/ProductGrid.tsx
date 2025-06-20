import React, { useState, useEffect } from 'react';
import { Grid, Card, CardMedia, CardContent, Typography, Pagination, Box, CircularProgress } from '@mui/material';
import dynamic from 'next/dynamic';
import { useCollectionsStore } from '@/store/collectionStore';

const DragDropContext = dynamic(
    () => import('react-beautiful-dnd').then(mod => mod.DragDropContext),
    { ssr: false }
);
const Droppable = dynamic(
    () => import('react-beautiful-dnd').then(mod => mod.Droppable),
    { ssr: false }
);
const Draggable = dynamic(
    () => import('react-beautiful-dnd').then(mod => mod.Draggable),
    { ssr: false }
);

const CollectionGrid: React.FC = () => {
    const { collections, isLoading, page, pageSize, totalCount, setPage, reorderCollections } = useCollectionsStore();
    const [isBrowser, setIsBrowser] = useState(false);

    useEffect(() => {
        setIsBrowser(true);
    }, []);

    const handleDragEnd = (result: any) => {
        if (!result.destination) return;

        const sourceIndex = result.source.index;
        const destinationIndex = result.destination.index;

        reorderCollections(sourceIndex, destinationIndex);
    };

    const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
        setPage(value);
    };

    if (isLoading) {
        return (
            <Box className="flex justify-center p-8">
                <CircularProgress />
            </Box>
        );
    }

    if (collections.length === 0) {
        return (
            <Typography variant="body1" className="p-4">
                Koleksiyon bulunamadı.
            </Typography>
        );
    }

    const totalPages = Math.ceil(totalCount / pageSize);

    if (!isBrowser) {
        return (
            <Box>
                <Grid container spacing={3}>
                    {collections.map((collection, index) => (
                        <Grid item xs={6} sm={4} md={3} key={`collection-${collection.id}`}>
                            <Card className="h-full flex flex-col">
                                {collection.type === 0 && collection.products && collection.products[0] && (
                                    <CardMedia
                                        component="img"
                                        height="200"
                                        image={collection.products[0].url}
                                        alt={collection.info.name}
                                        className="h-48 object-cover"
                                    />
                                )}
                                <CardContent className="flex-1">
                                    <Typography variant="h6" component="div">
                                        {collection.info.name}
                                    </Typography>
                                    {collection.type === 1 && collection.filters && collection.filters.filters && (
                                        <Box mt={1}>
                                            <Typography variant="body2" color="text.secondary">
                                                Filtreler:
                                            </Typography>
                                            {collection.filters.filters.map((filter, idx) => (
                                                <Typography key={idx} variant="body2" color="text.secondary">
                                                    {filter.title}: {filter.valueName}
                                                </Typography>
                                            ))}
                                        </Box>
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
                {totalPages > 1 && (
                    <Box className="flex justify-center mt-6">
                        <Pagination
                            count={totalPages}
                            page={page}
                            onChange={handlePageChange}
                            color="primary"
                        />
                    </Box>
                )}
            </Box>
        );
    }

    return (
        <Box>
            <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="collections" direction="horizontal">
                    {(provided) => (
                        <Grid
                            container
                            spacing={3}
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                        >
                            {collections.map((collection, index) => (
                                <Draggable
                                    key={`collection-${collection.id}`}
                                    draggableId={`collection-${collection.id}`}
                                    index={index}
                                >
                                    {(provided) => (
                                        <Grid
                                            item
                                            xs={6}
                                            sm={4}
                                            md={3}
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                        >
                                            <Card className="h-full flex flex-col">
                                                {collection.type === 0 && collection.products && collection.products[0] && (
                                                    <CardMedia
                                                        component="img"
                                                        height="200"
                                                        image={collection.products[0].url}
                                                        alt={collection.info.name}
                                                        className="h-48 object-cover"
                                                    />
                                                )}
                                                <CardContent className="flex-1">
                                                    <Typography variant="h6" component="div">
                                                        {collection.info.name}
                                                    </Typography>
                                                    {collection.type === 1 && collection.filters && collection.filters.filters && (
                                                        <Box mt={1}>
                                                            <Typography variant="body2" color="text.secondary">
                                                                Filtreler:
                                                            </Typography>
                                                            {collection.filters.filters.map((filter, idx) => (
                                                                <Typography key={idx} variant="body2" color="text.secondary">
                                                                    {filter.title}: {filter.valueName}
                                                                </Typography>
                                                            ))}
                                                        </Box>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        </Grid>
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                        </Grid>
                    )}
                </Droppable>
            </DragDropContext>

            {totalPages > 1 && (
                <Box className="flex justify-center mt-6">
                    <Pagination
                        count={totalPages}
                        page={page}
                        onChange={handlePageChange}
                        color="primary"
                    />
                </Box>
            )}
        </Box>
    );
};

export default CollectionGrid;