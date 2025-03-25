// app/cameratrap/locations/layout.jsx
import { DeploymentMapProvider } from "components/cameratrap/deployments/DeploymentMapContext";

export default function LocationsLayout({ children }) {
  return (
    <DeploymentMapProvider>
      <div className="locations-layout">{children}</div>
    </DeploymentMapProvider>
  );
}
