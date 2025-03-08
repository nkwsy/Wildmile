import { DeploymentMapProvider } from "components/cameratrap/deployments/DeploymentMapContext";
import { LocationNav } from "./LocationNav";
export default function Layout({ children }) {
  return (
    <DeploymentMapProvider>
      <LocationNav />
        {children}
    </DeploymentMapProvider>
  );
}
