import { Title, Portal, Box } from "@mantine/core";
import { ModMapWrapper } from "components/projects/canvas_base";

export default async function Layout({ children }) {
  //   const categories = await getCategories();
  return (
    <>
      {/* <Title
        order={2}
        ta="right"
        mt="sm"
      >{`${params.project} ${params.section}'s Modules`}</Title> */}

      <Portal>
        <ModMapWrapper>
          <Box sx={{ position: "relative", width: "100%", height: "500px" }}>
            {children}
          </Box>
        </ModMapWrapper>
      </Portal>
    </>
  );
}
