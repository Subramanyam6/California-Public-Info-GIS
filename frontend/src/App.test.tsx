import React from 'react';
import { render, screen } from '@testing-library/react';

jest.mock('./hooks/useMapData', () => ({
  useMapData: jest.fn(),
}));

jest.mock('./hooks/useWaterQuality', () => ({
  useWaterQuality: jest.fn(),
}));

jest.mock('./components/Map/MapContainer', () => () => (
  <div data-testid="map-container">Map Container</div>
));

jest.mock('./components/UI/Sidebar', () => () => (
  <aside data-testid="sidebar">Sidebar</aside>
));

jest.mock('./components/UI/AboutButton', () => () => <div>About</div>);
jest.mock('./components/UI/Footer', () => () => <div>Footer</div>);
jest.mock('./components/UI/DataPanel', () => () => <div>Data Panel</div>);

import App from './App';
import { useMapData } from './hooks/useMapData';
import { useWaterQuality } from './hooks/useWaterQuality';

const mockedUseMapData = useMapData as jest.Mock;
const mockedUseWaterQuality = useWaterQuality as jest.Mock;

describe('App', () => {
  beforeEach(() => {
    mockedUseMapData.mockReturnValue({
      counties: [],
      countyBoundaries: null,
      treatmentPlants: [],
      loading: false,
      error: null,
    });

    mockedUseWaterQuality.mockReturnValue({
      waterQualityStats: null,
      worstCounties: null,
      loading: false,
    });
  });

  it('renders main layout when data is available', () => {
    render(<App />);

    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('map-container')).toBeInTheDocument();
  });

  it('renders loading screen while fetching data', () => {
    mockedUseMapData.mockReturnValue({
      counties: null,
      countyBoundaries: null,
      treatmentPlants: null,
      loading: true,
      error: null,
    });

    render(<App />);

    expect(
      screen.getByText(/Launching Water Intelligence Workspace/i)
    ).toBeInTheDocument();
  });
});
