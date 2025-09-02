"use client";
import { Grid, GridCol } from "@mantine/core";
import { AdminSidebar } from "components/admin/AdminSidebar";

export default function AdminLayout({ children }) {
  return (
    <Grid>
      <GridCol span={3}>
        <AdminSidebar />
      </GridCol>
      <GridCol span={9}>{children}</GridCol>
    </Grid>
  );
}
