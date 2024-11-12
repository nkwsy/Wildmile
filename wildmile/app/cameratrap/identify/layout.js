// import { getCategories } from "#/app/api/categories/getCategories";
// import { Boundary } from "#/ui/boundary";
// import { TabGroup } from "#/ui/tab-group";
// import { CounterProvider } from "app/context/counter-context";
// import ContextClickCounter from "./context-click-counter";

import React from "react";
import { IdentificationProvider } from "components/cameratrap/ContextCamera";
import TaxaSearch, { WildlifeSidebar } from "components/cameratrap/TaxaSearch";

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
    <>
      <IdentificationProvider>
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

        {/* <TaxaSearch /> */}
        <div>{children}</div>
      </IdentificationProvider>
    </>
  );
}
