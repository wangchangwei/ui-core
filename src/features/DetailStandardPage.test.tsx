import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { DetailStandardPage } from './DetailStandardPage';
import { ExampleResourceNotFoundError, createExampleService } from '../domain/page-standard-example';

vi.mock('../domain/page-standard-example', async () => {
  const actual = await vi.importActual<typeof import('../domain/page-standard-example')>('../domain/page-standard-example');
  return { ...actual, createExampleService: vi.fn() };
});

const mockedCreateExampleService = vi.mocked(createExampleService);

function renderPage(id = 'example-1') {
  return render(<MemoryRouter initialEntries={[`/page-standards/detail?id=${id}`]}><DetailStandardPage /></MemoryRouter>);
}

describe('detail standard example', () => {
  beforeEach(() => {
    mockedCreateExampleService.mockReset();
  });

  it('keeps the overview visible when related resources fail independently', async () => {
    const actual = await vi.importActual<typeof import('../domain/page-standard-example')>('../domain/page-standard-example');
    const service = actual.createExampleService();
    mockedCreateExampleService.mockReturnValue({ ...service,
      get: vi.fn().mockResolvedValue({ id: 'example-1', name: 'Campaign launch', description: 'Description', categoryId: 'campaigns', tag: 'Enterprise', status: 'active', updatedAt: '2026-10-24' }),
      list: vi.fn().mockRejectedValue(new Error('Related request failed')),
    });

    renderPage();

    expect((await screen.findAllByText('Campaign launch')).length).toBeGreaterThan(0);
    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: 'Retry' })).toBeInTheDocument();
    expect(screen.getByText('Related request failed')).toBeInTheDocument();
  });

  it('shows a dedicated not-found state without a retry action', async () => {
    const actual = await vi.importActual<typeof import('../domain/page-standard-example')>('../domain/page-standard-example');
    const service = actual.createExampleService();
    mockedCreateExampleService.mockReturnValue({ ...service,
      get: vi.fn().mockRejectedValue(new ExampleResourceNotFoundError('missing-resource')),
      list: vi.fn(),
    });

    renderPage('missing-resource');

    expect(await screen.findByText('Resource not found')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back to resources' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Retry' })).not.toBeInTheDocument();
  });
});
