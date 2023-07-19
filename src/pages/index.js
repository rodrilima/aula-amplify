import {
  Box,
  Container,
  List,
  ListItem,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import Head from "next/head";
import { useEffect, useState } from "react";
import { studentsApi } from "src/api/students";
import { Layout as DashboardLayout } from "src/layouts/dashboard/layout";

const Page = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);

  useEffect(() => {
    studentsApi.list().then((data) => {
      setStudents(data);
    });
  }, []);

  return (
    <>
      <Head>
        <title>Overview | Devias Kit</title>
      </Head>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8,
        }}
      >
        <Container maxWidth="xl">
          <Paper sx={{ p: 2 }}>
            <Typography variant="h4">Os sobreviventes</Typography>
            <Select
              multiple
              value={selectedStudents}
              onChange={(e) => setSelectedStudents(e.target.value)}
              renderValue={(selected) => selected.join(', ')}
            >
              {students.map((student) => (
                <MenuItem key={student.id}>{student.name}</MenuItem>
              ))}
            </Select>
          </Paper>
        </Container>
      </Box>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
