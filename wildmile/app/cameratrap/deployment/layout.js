import React from "react";
import { IdentificationProvider } from "components/cameratrap/ContextCamera";
import { DeploymentMapProvider } from "components/cameratrap/deployments/DeploymentMapContext";
import TaxaSearch, { WildlifeSidebar } from "components/cameratrap/TaxaSearch";
import { Container } from "@mantine/core";
const title = "Animal Identification";

// export const metadata = {
//   title,
//   openGraph: {
//     title,
//     images: [`/api/og?title=${title}`],
//   },
// };

export default async function Layout({ children }) {
  //   const categories = await getCategories();
  return (
    <Container maxwidth="95%" my="5rem">
      <IdentificationProvider>
        <DeploymentMapProvider>
          {/* <TabGroup
                  path="/context"
                  items={[
                    {
                      text: "Home",
                    },
                    ...categories.map((x) => ({
                      text: x.name,
                      slug: x.slug,
                    })),
                  ]}
                /> */}

          <div>{children}</div>
        </DeploymentMapProvider>
      </IdentificationProvider>
    </Container>
  );
}
