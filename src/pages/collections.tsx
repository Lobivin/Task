import { NextPage } from 'next';
import { useEffect, useState, useMemo } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import LayoutComponent from './loyout/LayoutComponent';
import {
    useCollections,
    useAuth,
    useDebounce,
    useLocalStorage,
    useErrorHandler
} from '@/hooks';
import { Collection } from '@/types';
import {
    Container,
    Typography,
    Box,
    Paper,
    Grid,
    Card,
    CardContent,
    Button,
    CircularProgress,
    Alert,
    Chip,
    Pagination,
    InputAdornment,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Skeleton,
} from '@mui/material';
import {
    Search as SearchIcon,
    FilterList as FilterIcon,
    Edit as EditIcon,
    Visibility as ViewIcon,
    Refresh as RefreshIcon,
} from '@mui/icons-material';

const Collections: NextPage = () => {
    const router = useRouter();

    const { isAuthenticated, isLoading: authLoading,  isHydrated } = useAuth();
    const { collections, loading, error, refreshCollections } = useCollections();
    const { clearError, handleError } = useErrorHandler();

    const [searchTerm, setSearchTerm] = useLocalStorage('collections-search', '');
    const [filterType, setFilterType] = useLocalStorage('collections-filter', 'all');
    const [currentPage, setCurrentPage] = useLocalStorage('collections-page', 1);
    const [pageSize] = useLocalStorage('collections-pageSize', 12);

    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    const [refreshing, setRefreshing] = useState(false);

    const shouldShowContent = useMemo(() => {
        return isHydrated && !authLoading && isAuthenticated;
    }, [isHydrated, authLoading, isAuthenticated]);

    const shouldRedirect = useMemo(() => {
        return isHydrated && !authLoading && !isAuthenticated;
    }, [isHydrated, authLoading, isAuthenticated]);

    useEffect(() => {
        if (shouldRedirect) {
            router.replace('/login?callbackUrl=/collections');
        }
    }, [shouldRedirect, router]);

    useEffect(() => {
        return () => {
            clearError();
        };
    }, [clearError]);

    const filteredCollections = useMemo(() => {
        return collections.filter((collection: Collection) => {
            const matchesSearch = collection.info.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                collection.info.description.toLowerCase().includes(debouncedSearchTerm.toLowerCase());

            if (filterType === 'all') return matchesSearch;
            if (filterType === 'active') return matchesSearch && collection.type === 1;
            if (filterType === 'inactive') return matchesSearch && collection.type === 0;

            return matchesSearch;
        });
    }, [collections, debouncedSearchTerm, filterType]);

    const { totalItems, totalPages, paginatedCollections } = useMemo(() => {
        const total = filteredCollections.length;
        const pages = Math.ceil(total / pageSize);
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginated = filteredCollections.slice(startIndex, endIndex);

        return {
            totalItems: total,
            totalPages: pages,
            paginatedCollections: paginated
        };
    }, [filteredCollections, currentPage, pageSize]);

    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            await refreshCollections();
        } catch (err: any) {
            handleError(err.message || 'Koleksiyonlar yenilenemedi');
        } finally {
            setRefreshing(false);
        }
    };

    const handleViewCollection = (collectionId: number) => {
        router.push(`/collections/${collectionId}`);
    };

    const handleEditCollection = (collectionId: number) => {
        router.push(`/collections/${collectionId}/edit`);
    };

    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearchTerm, filterType, setCurrentPage]);

    const renderSkeletonCards = () => (
        Array.from({ length: pageSize }).map((_, index) => (
            <Grid item xs={12} sm={6} lg={4} key={`skeleton-${index}`}>
                <Card sx={{ height: '100%' }}>
                    <Skeleton variant="rectangular" height={200} />
                    <CardContent>
                        <Skeleton height={32} />
                        <Skeleton height={20} sx={{ mt: 1 }} />
                        <Skeleton height={20} sx={{ mt: 1 }} />
                        <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                            <Skeleton variant="rectangular" height={32} width={80} />
                            <Skeleton variant="rectangular" height={32} width={80} />
                        </Box>
                    </CardContent>
                </Card>
            </Grid>
        ))
    );

    if (!isHydrated || authLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (shouldRedirect) {
        return null;
    }

    if (!shouldShowContent) {
        return null;
    }

    return (
        <>
            <Head>
                <title>Koleksiyonlar - Koleksiyon Yönetim Platformu</title>
                <meta name="description" content="Koleksiyon yönetim platformu - tüm koleksiyonlarınızı görüntüleyin ve yönetin" />
            </Head>

            <LayoutComponent>
                <Container maxWidth="xl">
                    <Box sx={{ mb: 4 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                            <div>
                                <Typography
                                    variant="h4"
                                    component="h1"
                                    sx={{ fontWeight: 'bold', mb: 1 }}
                                    color="text.primary"
                                >
                                    Koleksiyonlar
                                </Typography>
                            </div>
                            <Button
                                variant="contained"
                                onClick={handleRefresh}
                                disabled={loading || refreshing}
                                startIcon={refreshing ? <CircularProgress size={20} /> : <RefreshIcon />}
                                sx={{ height: 'fit-content' }}
                            >
                                {refreshing ? 'Yenileniyor...' : 'Yenile'}
                            </Button>
                        </Box>

                        <Paper sx={{ p: 3, mb: 3 }}>
                            <Grid container spacing={3} alignItems="center">
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        placeholder="Koleksiyon ara..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <SearchIcon color="action" />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <FormControl fullWidth>
                                        <InputLabel>Durum Filtresi</InputLabel>
                                        <Select
                                            value={filterType}
                                            label="Durum Filtresi"
                                            onChange={(e) => setFilterType(e.target.value)}
                                            startAdornment={<FilterIcon sx={{ mr: 1, color: 'action.active' }} />}
                                        >
                                            <MenuItem value="all">Tümü</MenuItem>
                                            <MenuItem value="active">Aktif</MenuItem>
                                            <MenuItem value="inactive">Pasif</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} md={2}>
                                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                                        {totalItems} sonuç
                                    </Typography>
                                </Grid>
                            </Grid>
                        </Paper>
                    </Box>

                    {error && (
                        <Alert
                            severity="error"
                            sx={{ mb: 3 }}
                            onClose={clearError}
                            action={
                                <Button color="inherit" size="small" onClick={handleRefresh}>
                                    Tekrar Dene
                                </Button>
                            }
                        >
                            {error}
                        </Alert>
                    )}

                    {loading ? (
                        <Grid container spacing={3}>
                            {renderSkeletonCards()}
                        </Grid>
                    ) : paginatedCollections.length === 0 ? (
                        <Paper sx={{ p: 6, textAlign: 'center' }}>
                            <Typography variant="h6" color="text.secondary" gutterBottom>
                                Koleksiyon bulunamadı
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                {debouncedSearchTerm || filterType !== 'all'
                                    ? 'Arama kriterlerinize uygun koleksiyon bulunamadı.'
                                    : 'Henüz hiç koleksiyon eklenmemiş.'}
                            </Typography>
                            {(debouncedSearchTerm || filterType !== 'all') && (
                                <Button
                                    variant="outlined"
                                    onClick={() => {
                                        setSearchTerm('');
                                        setFilterType('all');
                                    }}
                                >
                                    Filtreleri Temizle
                                </Button>
                            )}
                        </Paper>
                    ) : (
                        <>
                            <Grid container spacing={3} sx={{ mb: 4 }}>
                                {paginatedCollections.map((collection: Collection) => (
                                    <Grid item xs={12} sm={6} lg={4} key={collection.id}>
                                        <Card
                                            sx={{
                                                height: '100%',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                transition: 'all 0.2s ease-in-out',
                                                '&:hover': {
                                                    transform: 'translateY(-4px)',
                                                    boxShadow: 4,
                                                }
                                            }}
                                        >
                                            <CardContent sx={{ flexGrow: 1, p: 3 }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                                    <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold', flex: 1 }}>
                                                        {collection.info.name}
                                                    </Typography>
                                                    <Chip
                                                        label={collection.type === 1 ? 'Aktif' : 'Pasif'}
                                                        color={collection.type === 1 ? 'success' : 'default'}
                                                        size="small"
                                                    />
                                                </Box>

                                                <Box
                                                    sx={{
                                                        mb: 3,
                                                        color: 'text.secondary',
                                                        display: '-webkit-box',
                                                        WebkitLineClamp: 3,
                                                        WebkitBoxOrient: 'vertical',
                                                        overflow: 'hidden'
                                                    }}
                                                    dangerouslySetInnerHTML={{ __html: collection.info.description }}
                                                />

                                                <Box sx={{ display: 'flex', gap: 1, mt: 'auto' }}>
                                                    <Button
                                                        variant="contained"
                                                        startIcon={<EditIcon />}
                                                        onClick={() => handleEditCollection(collection.id)}
                                                        size="small"
                                                        sx={{ flex: 1 }}
                                                    >
                                                        Düzenle
                                                    </Button>
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>

                            {totalPages > 1 && (
                                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                                    <Pagination
                                        count={totalPages}
                                        page={currentPage}
                                        onChange={(_, page) => setCurrentPage(page)}
                                        color="primary"
                                        size="large"
                                        showFirstButton
                                        showLastButton
                                    />
                                </Box>
                            )}
                        </>
                    )}
                </Container>
            </LayoutComponent>
        </>
    );
};

export default Collections;