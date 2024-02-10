// Importing necessary dependencies and components
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CsvDownloadButton from 'react-json-to-csv';
import {
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TablePagination,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  Box,
  Collapse,
  IconButton,
  Typography,
} from '@material-ui/core';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import './ManualDashboard.css';

// Functional component for ManualDashboard
const ManualDashboard = () => {
  // State variables for managing data and UI
  const [employeesData, setEmployeesData] = useState([]);
  const [searchEmployeeCode, setSearchEmployeeCode] = useState('');
  const [searchedEmployee, setSearchedEmployee] = useState(null);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [isSearchBarVisible, setIsSearchBarVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationOptions, setLocationOptions] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [csv, setcsv] = useState([]);

  // Fetching location options from the API on component mount
  useEffect(() => {
    const fetchLocationOptions = async () => {
      try {
        const response = await axios.get('http://localhost:7789/api/uniqueOfficeAddresses');
        setLocationOptions(response.data);
      } catch (error) {
        console.error('Error fetching location options:', error);
      }
    };
    fetchLocationOptions();
  }, []);

  // Handling click on location dropdown
  const handleLocationClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // Handling location selection in the dropdown
  const handleLocationClose = (value) => {
    setAnchorEl(null);
    setSelectedLocation(value);
  };

  // Handling page change in pagination
  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  // Handling rows per page change in pagination
  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Fetching employee data based on selected filters
  const fetchEmployeesData = async () => {
    try {
      const response = await axios.get('http://localhost:7789/api/roshanFilterEmployeeData', {
        headers: {
          'x-auth-token': localStorage.getItem("token"),
        },
        params: { location: selectedLocation, fromDate: fromDate, toDate: toDate },
      });
      console.log('Data from API:', response.data);
      setEmployeesData(response.data);
      setIsSearchBarVisible(true);
    } catch (error) {
      console.error('Error fetching employee data:', error);
    }
  };

  // Searching for a specific employee by code
  const searchEmployee = async () => {
    if (!searchEmployeeCode) return;

    try {
      const response = await axios.get(`http://localhost:7789/api/employee/${searchEmployeeCode}`);
      setSearchedEmployee(response.data);
    } catch (error) {
      console.error('Error searching for employee:', error);
      setSearchedEmployee(null);
    }
  };

  // Toggling the expanded view of employee details
  const handleToggle = (empCode) => {
    setEmployeesData((prevEmployeesData) => {
      const updatedEmployeesData = prevEmployeesData.map((employee) =>
        employee.EMPCODE === empCode
          ? { ...employee, open: !employee.open }
          : { ...employee, open: false }
      );
      return updatedEmployeesData;
    });
  };

  // Handling search input change and fetching filtered data
  const handleSearch = async (event) => {
    setSearchTerm(event.target.value);
    if (event.target.value) {
      const response = await axios.get(`http://localhost:7789/api/roshanFilterEmployeeData/${event.target.value}`, {
        params: { location: selectedLocation, fromDate: fromDate, toDate: toDate },
      });

      setEmployeesData(response.data);
      const filterVariable = employeesData.map(entry => ({
        S_no: entry.S_no,
        EMPCODE: entry.EMPCODE,
        Name: entry.Name,
        Current_Designation: entry.Current_Designation,
        punchData: entry.punchData.map(punch => ({
          punchType: punch.punchType,
          punchDateTime: punch.punchDateTime,
          selectedDate: punch.selectedDate
        }))
      }));
      setcsv(filterVariable);
    }

    console.log(event.target.value);

    setPage(0);
  };

  // Resetting all filters and search
  const handleReset = () => {
    setSearchTerm('');
    setFromDate('');
    setToDate('');
    setSelectedLocation('');
    setIsSearchBarVisible(false);
    setEmployeesData([]);
  };

  // Handling page change in employee details expansion
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handling rows per page change in employee details expansion
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Component for rendering punch data in each table cell
  const PunchTableCell = ({ punch }) => {
    const getCellStyle = () => {
      if (punch.punchType === 'PunchIn') {
        return { backgroundColor: 'lightyellow' };
      } else if (punch.punchType === 'PunchOut') {
        return { backgroundColor: 'lightskyblue' };
      } else {
        return {};
      }
    };

    const formattedPunchType = punch.punchType === 'PunchIn' ? 'Punch In' : 'Punch Out';

    return (
      <TableCell style={getCellStyle()}>
        {formattedPunchType}
      </TableCell>
    );
  };

  // JSX structure for the ManualDashboard component
  return (
    <div>
      <h1 style={{ textAlign: 'center' }}>Dashboard</h1>
      <div className="filter-controls-container">
        <div className="filter-controls">
          {/* From Date filter */}
          <label className="labels">
            From Date:
            <TextField
              placeholder="From Date:"
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              variant="outlined"
              size="small"
              inputProps={{ max: new Date().toISOString().split('T')[0] }}
            />
          </label>
          {/* To Date filter */}
          <label className="labels">
            To Date:
            <TextField
              placeholder="To Date:"
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              variant="outlined"
              size="small"
              inputProps={{ max: new Date().toISOString().split('T')[0] }}
            />
          </label>
          {/* Location filter */}
          <label className="labels">
            Location:
            <Select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              style={{ height: '3rem' }}
              variant="outlined"
              displayEmpty
            >
              <MenuItem value="" disabled>
                All Locations
              </MenuItem>
              {locationOptions.map((location) => (
                <MenuItem key={location} value={location}>
                  {location}
                </MenuItem>
              ))}
            </Select>
          </label>
        </div>
        {/* Buttons for search, reset, and CSV download */}
        <div className="button-container">
          <Button
            variant="contained"
            color="primary"
            onClick={fetchEmployeesData}
            className="custom-button"
          >
            Search
          </Button>
          <Button
            onClick={handleReset}
            variant="contained"
            color="default"
            className="reset-button"
          >
            Reset
          </Button>
          <CsvDownloadButton data={csv} style={{ backgroundColor: "#3df26d", color: "white" }} />
        </div>
      </div>
      {/* Search bar */}
      {isSearchBarVisible && (
        <div className="searchbar">
          <TextField
            type="text"
            variant="outlined"
            placeholder="Search by name"
            value={searchTerm}
            onChange={handleSearch}
            style={{
              backgroundColor: "white",
              color: "black",
            }}
          />
        </div>
      )}
      {/* Table displaying employee data */}
      {employeesData.length > 0 && (
        <TableContainer component={Paper} className="EmployeeTable">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell />
                <TableCell>S.No</TableCell>
                <TableCell>Employee Code</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Current Designation</TableCell>
                <TableCell>Office Address</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {employeesData
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((employee, index) => (
                  <React.Fragment key={employee.EMPCODE}>
                    <TableRow>
                      <TableCell>
                        <IconButton
                          aria-label="expand row"
                          size="small"
                          onClick={() => handleToggle(employee.EMPCODE)}
                        >
                          {employee.open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                        </IconButton>
                      </TableCell>
                      <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                      <TableCell>{employee.EMPCODE}</TableCell>
                      <TableCell>{employee.Name}</TableCell>
                      <TableCell>{employee.Current_Designation}</TableCell>
                      <TableCell>{employee.OfficeAddress}</TableCell>
                    </TableRow>
                    {/* Expanded row displaying punch data */}
                    <TableRow>
                      <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={5}>
                        <Collapse in={employee.open} timeout="auto" unmountOnExit style={{ textAlign: 'center' }}>
                          <Box sx={{ margin: 1 }}>
                            <Typography variant="h6" gutterBottom component="div">
                              Punch Data
                            </Typography>
                            {/* Table for displaying punch data */}
                            <Table size="small" aria-label="punch-data">
                              <TableHead>
                                <TableRow>
                                  <TableCell style={{ textAlign: 'center' }}>S.No</TableCell>
                                  <TableCell style={{ textAlign: 'center' }}>Punch Type</TableCell>
                                  <TableCell style={{ textAlign: 'center' }}>Punch Date</TableCell>
                                  <TableCell style={{ textAlign: 'center' }}>Punch Time</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {/* Mapping and rendering each punch data entry */}
                                {employee.punchData.map((punch, punchIndex) => (
                                  <TableRow key={punch._id}>
                                    <TableCell style={{ textAlign: 'center', border: '1px solid #dddddd' }}>{punchIndex + 1}</TableCell>
                                    <PunchTableCell punch={punch} />
                                    <TableCell style={{ textAlign: 'center', border: '1px solid #dddddd' }}>{new Date(punch.punchDateTime).toLocaleDateString('en-GB')}</TableCell>
                                    <TableCell style={{ textAlign: 'center', border: '1px solid #dddddd' }}>{new Date(punch.punchDateTime).toLocaleTimeString()}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Pagination for employee data */}
      {employeesData.length > 0 && (
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={employeesData.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      )}

      {/* Displaying searched employee details */}
      {searchedEmployee && (
        <div>
          <h3>Employee Details</h3>
          <p>Employee Code: {searchedEmployee.employeeCode}</p>
          <p>Name: {searchedEmployee.name}</p>
          <p>Current Designation: {searchedEmployee.currentDesignation}</p>
          <p>Office Address: {searchedEmployee.officeAddress}</p>
        </div>
      )}
    </div>
  );
};

// Exporting the ManualDashboard component as default
export default ManualDashboard;
