import "./globals.css"
import { UserProvider } from "./contexts/authContext";
import { ComplaintProvider } from "./contexts/complaintcontext";
import PropTypes from "prop-types";
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <UserProvider>
          <ComplaintProvider>
            {children}
          </ComplaintProvider>
        </UserProvider>
      </body>
    </html>
  );
}
RootLayout.propTypes = {
  children: PropTypes.node.isRequired,
};