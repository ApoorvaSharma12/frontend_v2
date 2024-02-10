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

const ManualDashboard = () => {
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
const[csv,setcsv]=useState([])
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



  // Call the fetchFilteredData function whenever searchTerm changes
 

  const handleLocationClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleLocationClose = (value) => {
    setAnchorEl(null);
    setSelectedLocation(value);
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

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
      // setEmployeesData(response.data.emp);
      setIsSearchBarVisible(true);
    } catch (error) {
      console.error('Error fetching employee data:', error);
    }
  };

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

  const handleSearch = async (event) => {
    setSearchTerm(event.target.value);
    if(event.target.value){
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

  const handleReset = () => {
    setSearchTerm('');
    setFromDate('');
    setToDate('');
    setSelectedLocation('');
    setIsSearchBarVisible(false);
    setEmployeesData([]);
  };


  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const PunchTableCell = ({ punch }) => {
    const getCellStyle = () => {
      if (punch.punchType === 'PunchIn') {
        return { backgroundColor: 'lightyellow' };
      } else if (punch.punchType === 'PunchOut') {
        return { backgroundColor: 'lightskyblue' };
      } else {
        // Add a default style if needed
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

  return (
    <div>
      <h1 style={{textAlign:'center'}}>Dashboard</h1>
      <div className="filter-controls-container">
        <div className="filter-controls">
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
                    <TableRow>
                      <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={5}>
                        <Collapse in={employee.open} timeout="auto" unmountOnExit style={{textAlign: 'center'}}>
                          <Box sx={{ margin: 1 }}>
                            <Typography variant="h6" gutterBottom component="div">
                              Punch Data
                            </Typography>
                            <Table size="small" aria-label="punch-data">
                              <TableHead>
                                <TableRow>
                                  <TableCell style={{ textAlign: 'center'}}>S.No</TableCell>
                                  <TableCell style={{ textAlign: 'center'}}>Punch Type</TableCell>
                                  <TableCell style={{ textAlign: 'center'}}>Punch Date</TableCell>
                                  <TableCell style={{ textAlign: 'center'}}>Punch Time</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
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

export default ManualDashboard;
