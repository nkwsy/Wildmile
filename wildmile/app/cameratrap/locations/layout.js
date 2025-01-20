import { DeploymentMapProvider } from "components/cameratrap/deployments/DeploymentMapContext";

export default function Layout({ children }) {
  return <DeploymentMapProvider>{children}</DeploymentMapProvider>;
}
