import React, { useEffect } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Button, Typography, CircularProgress, Alert
} from '@mui/material';
import { useCollectionsStore } from '@/store/collectionStore';
import { useRouter } from 'next/router';

const CollectionList: React.FC = () => {
  const { collections, isLoading, error, fetchCollections, setSelectedCollection } = useCollectionsStore();
  const router = useRouter();

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  const handleEditClick = (collectionId: number) => {
    const collection = collections.find(c => c.id === collectionId);
    if (collection) {
      setSelectedCollection(collection);
      router.push(`/collections/${collectionId}/edit`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return (
      <Alert severity="error" className="my-4">
        {error}
      </Alert>
    );
  }

  return (
    <div>
      <Typography variant="h5" component="h2" className="mb-4">
        Koleksiyonlar
      </Typography>

      {collections.length === 0 ? (
        <Typography>Koleksiyon bulunamadı.</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Koleksiyon Adı</TableCell>
                <TableCell>Tip</TableCell>
                <TableCell>URL</TableCell>
                <TableCell>İşlem</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {collections.map((collection) => (
                <TableRow key={collection.id}>
                  <TableCell>{collection.id}</TableCell>
                  <TableCell>{collection.info.name}</TableCell>
                  <TableCell>{collection.type === 0 ? 'Manuel' : 'Otomatik'}</TableCell>
                  <TableCell>{collection.info.url}</TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleEditClick(collection.id)}
                    >
                      Sabitleri Düzenle
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </div>
  );
};

export default CollectionList;
