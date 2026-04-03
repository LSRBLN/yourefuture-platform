/**
 * Syncfusion-optimierte OSINT Dashboard
 * Mit DataGrid, Charts, und professionellen UI-Komponenten
 */

'use client';

import React, { useState, useCallback } from 'react';
import {
  GridComponent,
  ColumnsDirective,
  ColumnDirective,
  Inject,
  Page,
  Search,
  Toolbar,
  Selection,
  Sort,
  Filter,
  PdfExport,
  ExcelExport,
} from '@syncfusion/ej2-react-grids';
import { ChartComponent, SeriesCollectionDirective, SeriesDirective, Inject as ChartInject, LineSeries, Category, Legend, Tooltip } from '@syncfusion/ej2-react-charts';
import { TabComponent, TabItemDirective } from '@syncfusion/ej2-react-navigations';
import { TextBoxComponent } from '@syncfusion/ej2-react-inputs';
import { ButtonComponent } from '@syncfusion/ej2-react-buttons';
import { DropDownListComponent } from '@syncfusion/ej2-react-dropdowns';

import {
  useUsernameSearch,
  useEmailSearch,
  usePhoneSearch,
  useDomainSearch,
  useReverseImageSearch,
  useCollectionStats,
  OSINTResult,
  BreachData,
  ImageSearchResult,
} from '@/lib/osint-api';

// ============ Types ============

interface GridData {
  id: string;
  source: string;
  type: string;
  data: string;
  accuracy: number;
  verified: boolean;
  timestamp: string;
}

interface BreachGridData {
  id: string;
  name: string;
  date: string;
  dataClasses: string;
  affectedCount: number;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
}

interface ImageGridData {
  id: string;
  url: string;
  domain: string;
  similarity: number;
  source: 'Qdrant' | 'MRISA';
  crawlDate: string;
}

// ============ Component ============

export function SyncfusionOSINTDashboard() {
  // State
  const [searchType, setSearchType] = useState<'username' | 'email' | 'phone' | 'domain' | 'image'>('username');
  const [searchQuery, setSearchQuery] = useState('');
  const [gridData, setGridData] = useState<GridData[]>([]);
  const [breachData, setBreachData] = useState<BreachGridData[]>([]);
  const [imageData, setImageData] = useState<ImageGridData[]>([]);
  const [searchTime, setSearchTime] = useState(0);
  const [totalResults, setTotalResults] = useState(0);

  // Hooks
  const usernameQuery = useUsernameSearch(searchType === 'username' ? searchQuery : '', false);
  const emailQuery = useEmailSearch(searchType === 'email' ? searchQuery : '', true);
  const phoneQuery = usePhoneSearch(searchType === 'phone' ? searchQuery : '');
  const domainQuery = useDomainSearch(searchType === 'domain' ? searchQuery : '', false);
  const imageQuery = useReverseImageSearch(searchType === 'image' ? searchQuery : '', true);
  const statsQuery = useCollectionStats();

  // Get active query based on search type
  const getActiveQuery = useCallback(() => {
    switch (searchType) {
      case 'username':
        return usernameQuery;
      case 'email':
        return emailQuery;
      case 'phone':
        return phoneQuery;
      case 'domain':
        return domainQuery;
      case 'image':
        return imageQuery;
      default:
        return usernameQuery;
    }
  }, [searchType, usernameQuery, emailQuery, phoneQuery, domainQuery, imageQuery]);

  const activeQuery = getActiveQuery();
  const isLoading = activeQuery.isLoading;
  const error = activeQuery.error;

  // Process results for grid
  const processResults = useCallback((response: any) => {
    if (!response?.data) return;

    setSearchTime(response.data.searchTime || 0);

    if (searchType === 'email' && response.data.breaches) {
      // Process breach data
      const breaches: BreachGridData[] = response.data.breaches.map((breach: BreachData, idx: number) => ({
        id: `breach-${idx}`,
        name: breach.name,
        date: breach.date,
        dataClasses: breach.dataClasses.join(', '),
        affectedCount: breach.affectedCount,
        severity: breach.affectedCount > 100000000 ? 'Critical' : 'High',
      }));
      setBreachData(breaches);
      setTotalResults(breaches.length);
    } else if (searchType === 'image' && response.data.matches) {
      // Process image data
      const images: ImageGridData[] = response.data.matches.map((match: ImageSearchResult, idx: number) => ({
        id: `image-${idx}`,
        url: match.url,
        domain: match.domain,
        similarity: Math.round(match.similarity_score * 100),
        source: match.source,
        crawlDate: match.crawlDate || new Date().toISOString(),
      }));
      setImageData(images);
      setTotalResults(images.length);
    } else if (response.data.results) {
      // Process regular OSINT results
      const results: GridData[] = response.data.results.map((result: OSINTResult, idx: number) => ({
        id: `result-${idx}`,
        source: result.source,
        type: result.type,
        data: typeof result.data === 'string' ? result.data : JSON.stringify(result.data),
        accuracy: Math.round(result.accuracy * 100),
        verified: result.verified,
        timestamp: result.timestamp,
      }));
      setGridData(results);
      setTotalResults(results.length);
    }
  }, [searchType]);

  // Update data when query completes
  React.useEffect(() => {
    if (activeQuery.data) {
      processResults(activeQuery.data);
    }
  }, [activeQuery.data, processResults]);

  // Handle search
  const handleSearch = useCallback(() => {
    if (!searchQuery.trim()) {
      return;
    }
    // The query hooks are already watching searchQuery and searchType
    // Just trigger by setting queries as enabled
  }, [searchQuery]);

  // Custom templates for grid
  const accuracyTemplate = (props: any) => {
    const percentage = props.accuracy;
    const color = percentage >= 90 ? '#10b981' : percentage >= 70 ? '#f59e0b' : '#ef4444';
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div
          style={{
            width: '100%',
            height: '20px',
            backgroundColor: '#e5e7eb',
            borderRadius: '4px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${percentage}%`,
              height: '100%',
              backgroundColor: color,
              transition: 'width 0.3s',
            }}
          />
        </div>
        <span style={{ minWidth: '40px' }}>{percentage}%</span>
      </div>
    );
  };

  const severityTemplate = (props: any) => {
    const severityColors = {
      Critical: '#ef4444',
      High: '#f59e0b',
      Medium: '#3b82f6',
      Low: '#10b981',
    };
    return (
      <div
        style={{
          backgroundColor: severityColors[props.severity as keyof typeof severityColors],
          color: 'white',
          padding: '4px 8px',
          borderRadius: '4px',
          textAlign: 'center',
          fontWeight: '500',
        }}
      >
        {props.severity}
      </div>
    );
  };

  const verifiedTemplate = (props: any) => {
    return props.verified ? (
      <span style={{ color: '#10b981', fontWeight: 'bold' }}>✓ Verified</span>
    ) : (
      <span style={{ color: '#6b7280' }}>Unverified</span>
    );
  };

  const similarityTemplate = (props: any) => {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ width: '120px', height: '20px', backgroundColor: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
          <div
            style={{
              width: `${props.similarity}%`,
              height: '100%',
              backgroundColor: props.similarity >= 90 ? '#10b981' : '#3b82f6',
            }}
          />
        </div>
        {props.similarity}%
      </div>
    );
  };

  // Chart data
  const chartData = [
    { month: 'Jan', sources: 8, findings: 15, breaches: 2 },
    { month: 'Feb', sources: 12, findings: 22, breaches: 3 },
    { month: 'Mar', sources: 15, findings: 28, breaches: 5 },
    { month: 'Apr', sources: 18, findings: 35, breaches: 4 },
    { month: 'May', sources: 22, findings: 42, breaches: 6 },
    { month: 'Jun', sources: 25, findings: 48, breaches: 8 },
  ];

  return (
    <div style={{ padding: '20px', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '20px', color: '#1f2937' }}>
          🔍 OSINT Intelligence Dashboard
        </h1>

        {/* Search Bar */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '15px',
            marginBottom: '20px',
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}
        >
          {/* Search Type Dropdown */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151' }}>
              Search Type
            </label>
            <DropDownListComponent
              dataSource={[
                { text: 'Username Search', value: 'username' },
                { text: 'Email Search', value: 'email' },
                { text: 'Phone Search', value: 'phone' },
                { text: 'Domain Search', value: 'domain' },
                { text: 'Reverse Image', value: 'image' },
              ]}
              fields={{ text: 'text', value: 'value' }}
              value={searchType}
              change={(e: any) => {
                setSearchQuery('');
                setSearchType(e.value);
              }}
              style={{ width: '100%' }}
            />
          </div>

          {/* Search Input */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151' }}>
              {searchType === 'username' && 'Username'}
              {searchType === 'email' && 'Email Address'}
              {searchType === 'phone' && 'Phone Number'}
              {searchType === 'domain' && 'Domain'}
              {searchType === 'image' && 'Image URL'}
            </label>
            <div
              onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
            >
              <TextBoxComponent
                value={searchQuery}
                change={(e: { value: string }) => setSearchQuery(e.value)}
                placeholder={`Enter ${searchType}...`}
                style={{ width: '100%' }}
              />
            </div>
          </div>

          {/* Search Button */}
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <ButtonComponent
              onClick={handleSearch}
              disabled={!searchQuery.trim() || isLoading}
              cssClass="e-success"
              style={{ width: '100%' }}
            >
              {isLoading ? 'Searching...' : 'Search'}
            </ButtonComponent>
          </div>
        </div>

        {/* Stats Bar */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '15px',
          }}
        >
          <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>Total Results</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937' }}>{totalResults}</div>
          </div>
          <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>Search Time</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#3b82f6' }}>{searchTime}ms</div>
          </div>
          {statsQuery.data?.data && (
            <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>Indexed Images</div>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#10b981' }}>
                {statsQuery.data.data.totalPoints}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div
          style={{
            backgroundColor: '#fee2e2',
            color: '#991b1b',
            padding: '15px',
            borderRadius: '8px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          ⚠️ {error instanceof Error ? error.message : 'An error occurred'}
        </div>
      )}

      {/* Results Tabs */}
      {(totalResults > 0 || isLoading) && (
        <TabComponent
          heightAdjustMode="Content"
          style={{ marginBottom: '30px' }}
        >
          {/* Results Grid Tab */}
          <TabItemDirective
            header={{ text: `Results (${searchType === 'email' ? 'Breaches' : searchType === 'image' ? 'Images' : 'OSINT'})` }}
          >
            {isLoading ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <div style={{ fontSize: '18px', fontWeight: 600, color: '#6b7280' }}>Loading…</div>
                <p style={{ marginTop: '20px', color: '#6b7280' }}>Searching...</p>
              </div>
            ) : searchType === 'email' && breachData.length > 0 ? (
              <GridComponent
                dataSource={breachData}
                allowPaging
                allowSorting
                allowFiltering
                allowExcelExport
                allowPdfExport
                toolbar={['ExcelExport', 'PdfExport', 'Search']}
                pageSettings={{ pageSize: 10 }}
                style={{ marginBottom: '20px' }}
              >
                <ColumnsDirective>
                  <ColumnDirective field="name" headerText="Breach Name" width="150" />
                  <ColumnDirective field="date" headerText="Date" width="120" type="date" format="yMd" />
                  <ColumnDirective field="dataClasses" headerText="Data Classes" width="200" />
                  <ColumnDirective field="affectedCount" headerText="Affected Users" width="150" type="number" />
                  <ColumnDirective
                    field="severity"
                    headerText="Severity"
                    width="120"
                    template={severityTemplate}
                  />
                </ColumnsDirective>
                <Inject services={[Page, Search, Toolbar, Selection, Sort, Filter, PdfExport, ExcelExport]} />
              </GridComponent>
            ) : searchType === 'image' && imageData.length > 0 ? (
              <GridComponent
                dataSource={imageData}
                allowPaging
                allowSorting
                allowFiltering
                allowExcelExport
                allowPdfExport
                toolbar={['ExcelExport', 'PdfExport', 'Search']}
                pageSettings={{ pageSize: 10 }}
                style={{ marginBottom: '20px' }}
              >
                <ColumnsDirective>
                  <ColumnDirective field="url" headerText="Image URL" width="250" />
                  <ColumnDirective field="domain" headerText="Domain" width="150" />
                  <ColumnDirective
                    field="similarity"
                    headerText="Similarity"
                    width="150"
                    template={similarityTemplate}
                  />
                  <ColumnDirective field="source" headerText="Source" width="100" />
                  <ColumnDirective field="crawlDate" headerText="Date" width="150" type="date" />
                </ColumnsDirective>
                <Inject services={[Page, Search, Toolbar, Selection, Sort, Filter, PdfExport, ExcelExport]} />
              </GridComponent>
            ) : gridData.length > 0 ? (
              <GridComponent
                dataSource={gridData}
                allowPaging
                allowSorting
                allowFiltering
                allowExcelExport
                allowPdfExport
                toolbar={['ExcelExport', 'PdfExport', 'Search']}
                pageSettings={{ pageSize: 10 }}
                style={{ marginBottom: '20px' }}
              >
                <ColumnsDirective>
                  <ColumnDirective field="source" headerText="Source" width="120" />
                  <ColumnDirective field="type" headerText="Type" width="150" />
                  <ColumnDirective field="data" headerText="Data" width="250" />
                  <ColumnDirective
                    field="accuracy"
                    headerText="Accuracy"
                    width="150"
                    template={accuracyTemplate}
                  />
                  <ColumnDirective
                    field="verified"
                    headerText="Status"
                    width="120"
                    template={verifiedTemplate}
                  />
                  <ColumnDirective field="timestamp" headerText="Timestamp" width="180" type="date" />
                </ColumnsDirective>
                <Inject services={[Page, Search, Toolbar, Selection, Sort, Filter, PdfExport, ExcelExport]} />
              </GridComponent>
            ) : null}
          </TabItemDirective>

          {/* Analytics Chart Tab */}
          <TabItemDirective header={{ text: 'Analytics' }}>
            <ChartComponent id="osint-chart" style={{ marginBottom: '20px' }}>
              <SeriesCollectionDirective>
                <SeriesDirective
                  dataSource={chartData}
                  xName="month"
                  yName="findings"
                  name="Total Findings"
                  width={2}
                  marker={{ visible: true, width: 10, border: { width: 2, color: '#F57C00' } }}
                />
                <SeriesDirective
                  dataSource={chartData}
                  xName="month"
                  yName="sources"
                  name="Sources"
                  width={2}
                  marker={{ visible: true, width: 10, border: { width: 2, color: '#EF5350' } }}
                />
              </SeriesCollectionDirective>
              <ChartInject services={[LineSeries, Category, Legend, Tooltip]} />
            </ChartComponent>
          </TabItemDirective>
        </TabComponent>
      )}

      {/* Empty State */}
      {!isLoading && totalResults === 0 && searchQuery && (
        <div
          style={{
            backgroundColor: 'white',
            padding: '60px 20px',
            borderRadius: '8px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '48px', marginBottom: '15px' }}>🔍</div>
          <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '10px', color: '#1f2937' }}>
            No Results Found
          </h3>
          <p style={{ color: '#6b7280' }}>
            Try searching for a different {searchType} or adjust your search criteria.
          </p>
        </div>
      )}

      {!isLoading && totalResults === 0 && !searchQuery && (
        <div
          style={{
            backgroundColor: 'white',
            padding: '60px 20px',
            borderRadius: '8px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '48px', marginBottom: '15px' }}>👆</div>
          <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '10px', color: '#1f2937' }}>
            Ready to Search
          </h3>
          <p style={{ color: '#6b7280' }}>Enter a {searchType} above to begin your OSINT investigation.</p>
        </div>
      )}
    </div>
  );
}

export default SyncfusionOSINTDashboard;
