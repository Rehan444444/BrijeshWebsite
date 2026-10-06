import { useRouter } from '@/lib/router';
import { Layout } from '@/components/Layout';
import { Dashboard } from '@/pages/Dashboard';
import { ScanPage } from '@/pages/ScanPage';
import { ReviewPage } from '@/pages/ReviewPage';
import { InvoicesPage } from '@/pages/InvoicesPage';
import { InvoiceDetailPage } from '@/pages/InvoiceDetailPage';
import { useInvoices } from '@/lib/invoiceStore';

function App() {
  const { route, navigate } = useRouter();
  const { invoices, loading, refetch } = useInvoices();

  return (
    <Layout route={route} navigate={navigate}>
      {route.name === 'dashboard' && (
        <Dashboard invoices={invoices} loading={loading} navigate={navigate} />
      )}
      {route.name === 'scan' && <ScanPage navigate={navigate} />}
      {route.name === 'review' && <ReviewPage id={route.id} navigate={navigate} />}
      {route.name === 'invoices' && (
        <InvoicesPage
          invoices={invoices}
          loading={loading}
          navigate={navigate}
          refetch={refetch}
        />
      )}
      {route.name === 'invoice' && (
        <InvoiceDetailPage id={route.id} navigate={navigate} />
      )}
    </Layout>
  );
}

export default App;
