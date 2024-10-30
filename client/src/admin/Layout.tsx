import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  return (
    <div className="d-flex">
      <Sidebar />
      <div className="content p-4" style={{ flex: 1 }}>
        {children}
      </div>
    </div>
  );
};

export default Layout;
