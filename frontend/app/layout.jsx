import "./globals.css"
import { UserProvider } from "./contexts/authContext";
import { ComplaintProvider } from "./contexts/complaintcontext";

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