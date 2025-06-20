import React, { useState } from 'react';
import {
  Paper, Typography, Accordion, AccordionSummary, AccordionDetails,
  FormControl, InputLabel, Select, MenuItem, Chip, Box, Button
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useCollectionsStore } from '@/store/collectionStore';
import { FilterOption } from '@/types';

const FilterPanel: React.FC = () => {
  const { filters, activeFilters, addFilter, removeFilter, clearFilters } = useCollectionsStore();
  const [selectedValues, setSelectedValues] = useState<Record<string, string>>({});

  const handleFilterChange = (filterId: string, value: string) => {
    setSelectedValues(prev => ({ ...prev, [filterId]: value }));
  };

  const handleAddFilter = (filter: FilterOption) => {
    const value = selectedValues[filter.id];
    if (value) {
      addFilter({
        id: filter.id,
        value,
        comparisonType: filter.comparisonType
      });
    }
  };

  const handleClearAll = () => {
    clearFilters();
    setSelectedValues({});
  };

  return (
    <Paper elevation={3} className="p-4 mb-4">
      <Typography variant="h6" className="mb-2">
        Filtreler
      </Typography>

      {activeFilters.length > 0 && (
        <Box className="mb-4 flex flex-wrap gap-2">
          {activeFilters.map(filter => {
            const filterOption = filters.find(f => f.id === filter.id);
            const filterValue = filterOption?.values.find(v => v.value === filter.value);

            return (
              <Chip
                key={`${filter.id}-${filter.value}`}
                label={`${filterOption?.title || filter.id}: ${filterValue?.valueName || filter.value}`}
                onDelete={() => removeFilter(filter.id)}
                color="primary"
                variant="outlined"
              />
            );
          })}
          <Button
            variant="outlined"
            color="secondary"
            size="small"
            onClick={handleClearAll}
          >
            Tümünü Temizle
          </Button>
        </Box>
      )}

      {filters.map((filter) => (
        <Accordion key={filter.id} className="mb-2">
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>{filter.title}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <FormControl fullWidth>
              <InputLabel id={`filter-label-${filter.id}`}>{filter.title}</InputLabel>
              <Select
                labelId={`filter-label-${filter.id}`}
                value={selectedValues[filter.id] || ''}
                onChange={(e) => handleFilterChange(filter.id, e.target.value)}
                label={filter.title}
              >
                {filter.values.map((value) => (
                  <MenuItem key={value.value} value={value.value}>
                    {value.valueName || value.value}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="contained"
              color="primary"
              className="mt-2"
              onClick={() => handleAddFilter(filter)}
              disabled={!selectedValues[filter.id]}
            >
              Filtre Ekle
            </Button>
          </AccordionDetails>
        </Accordion>
      ))}
    </Paper>
  );
};

export default FilterPanel;
