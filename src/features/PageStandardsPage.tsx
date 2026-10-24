import { Navigate, useSearchParams } from 'react-router-dom';

export function PageStandardsPage() {
  const [params] = useSearchParams();
  const patterns = ['table-list', 'detail', 'card-list', 'form'];
  const pattern = patterns.find(value => value === params.get('pattern')) ?? 'table-list';
  return <Navigate to={`/page-standards/${pattern}`} replace/>;
}
