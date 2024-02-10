import React, { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import axios from 'axios';
import SortIcon from '@mui/icons-material/Sort';
import {
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Button,
  Modal,
  Box
} from "@material-ui/core";
import './ManualEntry.css';

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 600,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
  borderRadius: 5,
};

const tableCellStyle = {
  fontSize: '14px',
  
  padding: "3px",
  textAlign:"center"
};

const getCurrentDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const ManualEntry = () => {
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [punchType, setPunchType] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [employeeCode, setEmployeeCode] = useState("");
  const [selectedDate, setSelectedDate] = useState(getCurrentDate());
  const [currentTime, setCurrentTime] = useState("");
  const [locationOptions, setLocationOptions] = useState([]);
  const [orderBy, setOrderBy] = useState('Name');
  const [order, setOrder] = useState('asc');

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleReset = () => {
    setSearchTerm('');
    setSelectedLocation('');
  };

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

    const currentFormattedTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setCurrentTime(currentFormattedTime);
  }, []);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/employees', {
          params: { location: selectedLocation }
        });
        setEmployees(response.data);
      } catch (error) {
        console.error('Error fetching employees:', error);
      }
    };

    fetchEmployees();
  }, [selectedLocation]);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleMakeEntry = (employee) => {
    setSelectedEmployee(employee);
    setEmployeeCode(employee.EMPCODE || "");
    setPunchType("");
    setSelectedTime("");
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
  };

  const handlePunchTypeChange = (event) => {
    setPunchType(event.target.value);
  };

  const handleTimeChange = (event) => {
    setSelectedTime(event.target.value);
  };

  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
  };

  const handleModalSubmit = () => {
    const entryData = {
      employeeCode,
      punchType,
      selectedTime,
      selectedDate,
    };

    console.log("Data to Post:", entryData);

    console.log("MongoDB Query:", {
      method: "POST",
      url: "http://localhost:7789/api/entries",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(entryData),
    });

    fetch("http://localhost:7789/api/entries", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(entryData),
    })
      .then((response) => {
        if (response.status === 201) {
          return response.json();
        } else if (response.status === 500) {
          throw new Error(`HTTP error! Status: ${response.status}`)
        } else {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
      })
      .then((data) => {
        console.log("Server response:", data);
        toast.success("Successfully logged!");
        handleModalClose();
      })
      .catch((error) => {
        console.error("Error submitting entry:", error);
        toast.error("Failed to submit entry. Please try again.");
      });
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const stableSort = (array, comparator) => {
    const stabilizedThis = array.map((el, index) => [el, index]);
    stabilizedThis.sort((a, b) => {
      const order = comparator(a[0], b[0]);
      if (order !== 0) {
        return order;
      }
      return a[1] - b[1];
    });
    return stabilizedThis.map((el) => el[0]);
  };

  const getComparator = (order, orderBy) => {
    return order === 'desc'
      ? (a, b) => descendingComparator(a, b, orderBy)
      : (a, b) => -descendingComparator(a, b, orderBy);
  };

  const descendingComparator = (a, b, orderBy) => {
    if (b[orderBy] < a[orderBy]) {
      return -1;
    }
    if (b[orderBy] > a[orderBy]) {
      return 1;
    }
    return 0;
  };

  const isSelected = (id) => selectedEmployee && selectedEmployee._id === id;

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - employees.length) : 0;

  const visibleRows = React.useMemo(
    () => {
      const filteredEmployees = employees.filter((employee) => {
        const fullName = `${employee.Name || ""} ${employee.EMPCODE || ""} ${employee.Current_Designation || ""}`;
        return fullName.toLowerCase().includes(searchTerm.toLowerCase());
      });
      return stableSort(filteredEmployees, getComparator(order, orderBy)).slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage,
      );
    },
    [employees, order, orderBy, page, rowsPerPage, searchTerm],
  );

  return (
    <div className="manualentry">
      <div className="pageheader">
        <h3>Manual Attendance Entry</h3>
      </div>
      <div className="inputsearch">
        <Select
          value={selectedLocation}
          onChange={(e) => setSelectedLocation(e.target.value)}
          style={{ height: '6 rem', marginRight: "10px", backgroundColor: "white" }}
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
        <TextField
          type="text"
          variant="outlined"
          placeholder="Search by name or Emp id"
          value={searchTerm}
          onChange={handleSearch}
          style={{
            backgroundColor: "white",
            color: "black",
          }}
        />
        <button
          onClick={handleReset}
          variant="contained"
          color="default"
          className="reset-button"
          style={{
            marginLeft: "20px", borderRadius: "5px", border: "none", color: "white"
          }}>Reset</button>
      </div>
      <TableContainer style={{ fontSize: "11px" }}>
        <Table className="tabledata" style={{ margin: "0 auto", width: "90%", border: "1px solid #ccc" }}>
          <TableHead>
            <TableRow style={{ textAlign: "center" }}>
            <TableCell style={tableCellStyle}>Serial Number</TableCell>
              <TableCell
                style={tableCellStyle}
                onClick={() => handleRequestSort('Name')}
              >
                Name<SortIcon style={{ marginLeft: "4px" }} />
              </TableCell>
              <TableCell
                style={tableCellStyle}
                onClick={() => handleRequestSort('EMPCODE')}
              >
                EMPCODE <SortIcon style={{ marginLeft: "4px" }} />
              </TableCell>
              <TableCell style={tableCellStyle}>DESIGNATION</TableCell>
              <TableCell style={tableCellStyle}>ACTION</TableCell>
              
            </TableRow>
          </TableHead>
          <TableBody>
            {visibleRows.map((employee, index) => (
              <TableRow
                key={employee._id}
                selected={isSelected(employee._id)}
              > 
                <TableCell style={{ padding: "3px",textAlign:"center" }}>{index + 1}</TableCell>
                <TableCell style={{ padding: "3px",textAlign:"center" }}>{employee.Name || ""}</TableCell>
                <TableCell style={{ padding: "3px",textAlign:"center" }}>{employee.EMPCODE || ""}</TableCell>
                <TableCell style={{ padding: "3px",textAlign:"center" }}>{employee.Current_Designation || ""}</TableCell>
                <TableCell style={{ padding: "3px",textAlign:"center" }}>
                  <Button
                    onClick={() => handleMakeEntry(employee)}
                    variant="contained"
                    color="primary"
                    className="search-button"
                    style={{
                      width: "150px",
                      backgroundColor: 'white',
                      border: "1px solid #DB252A",
                      color: '#DB252A',
                    }}
                  >
                    Make Entry
                  </Button>
                </TableCell>
                
              </TableRow>
            ))}
            {emptyRows > 0 && (
              <TableRow
                style={{
                  height: 33 * emptyRows,
                }}
              >
                <TableCell colSpan={5} />
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={employees.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      <Modal
        open={modalOpen}
        onClose={handleModalClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <h2 className="ModalHeading">Make Entry</h2>
          <p>Employee Name: {selectedEmployee?.Name || ""}</p>
          <p>Employee Code: {selectedEmployee?.EMPCODE || ""}</p>
          <p>Designation: {selectedEmployee?.Current_Designation || ""}</p>
          <FormControl>
            <InputLabel id="punchTypeLabel">Punch Type</InputLabel>
            <Select
              labelId="punchTypeLabel"
              id="punchType"
              style={{ width: "200px" }}
              value={punchType}
              onChange={handlePunchTypeChange}
            >
              <MenuItem value="PunchIn">Punch In</MenuItem>
              <MenuItem value="PunchOut">Punch Out</MenuItem>
            </Select>
          </FormControl>
          <TextField
            type="time"
            label="Select Time"
            style={{ width: "200px" }}
            value={selectedTime || currentTime}
            onChange={handleTimeChange}
          />
          <TextField
            type="date"
            label=""
            InputLabelProps={{ shrink: false }}
            style={{ width: "200px" }}
            value={selectedDate}
            onChange={handleDateChange}
            inputProps={{ max: getCurrentDate() }}
          />
          <div style={{ marginTop: "10px" }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleModalSubmit}
              style={{
                width: "150px",
                backgroundColor: '#DB252A',
                border: "1px solid #DB252A",
                color: "white"
              }}
            >
              Submit
            </Button>
            <Button onClick={handleModalClose}>Cancel</Button>
          </div>
        </Box>
      </Modal>
      <Toaster position="top-right" />
    </div>
  );
};

export default ManualEntry;


// import React, { useState, useEffect } from "react";
// import toast, { Toaster } from "react-hot-toast";
// import axios from 'axios';
// import {
//   TableContainer,
//   Table,
//   TableHead,
//   TableRow,
//   TableCell,
//   TableBody,
//   TablePagination,
//   TextField,
//   Select,
//   MenuItem,
//   InputLabel,
//   FormControl,
  
// } from "@material-ui/core";
// import Box from "@mui/material/Box";
// import Button from "@mui/material/Button";
// import Modal from "@mui/material/Modal";
// import './ManualEntry.css'

// const style = {
//   position: "absolute",
//   top: "50%",
//   left: "50%",
//   transform: "translate(-50%, -50%)",
//   width: 600,
//   bgcolor: "background.paper",
//   border: "2px solid #000",
//   boxShadow: 24,
//   p: 4,
//   borderRadius: 5,
// };

// const tableCellStyle = {
//   fontSize: '14px', // Adjust the font size as needed
//   padding: '8px',   // Adjust the padding as needed
// };

// // Helper function to get the current date in YYYY-MM-DD format
// const getCurrentDate = () => {
//   const now = new Date();
//   const year = now.getFullYear();
//   const month = String(now.getMonth() + 1).padStart(2, '0');
//   const day = String(now.getDate()).padStart(2, '0');
//   return `${year}-${month}-${day}`;
// };

// const ManualEntry = () => {
//   const [employees, setEmployees] = useState([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [page, setPage] = useState(0);
//   const [selectedLocation, setSelectedLocation] = useState('');
//   const [rowsPerPage, setRowsPerPage] = useState(10);
//   const [selectedEmployee, setSelectedEmployee] = useState(null);
//   const [modalOpen, setModalOpen] = useState(false);
//   const [punchType, setPunchType] = useState("");
//   const [selectedTime, setSelectedTime] = useState("");
//   const [employeeCode, setEmployeeCode] = useState("");
//   const [selectedDate, setSelectedDate] = useState(getCurrentDate()); // Set to current date
//   const [currentTime, setCurrentTime] = useState("");
//   const [locationOptions, setLocationOptions] = useState([]);

//   const handleReset = () => {
//     setSearchTerm('');
//     setSelectedLocation('');
//   };

//   useEffect(() => {
//     const fetchLocationOptions = async () => {
//       try {
//         const response = await axios.get('http://localhost:7789/api/uniqueOfficeAddresses');
//         setLocationOptions(response.data);
//       } catch (error) {
//         console.error('Error fetching location options:', error);
//       }
//     };
//     fetchLocationOptions();

//     // Set the currentTime state to the current time when the component mounts
//     const currentFormattedTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
//     setCurrentTime(currentFormattedTime);
//   }, []);

//   useEffect(() => {
//     // Fetch the API when employeesData state changes
//     const fetchEmployees = async () => {
//       try {
//         const response = await axios.get('http://localhost:5000/api/employees', {
//           params: { location: selectedLocation }
//         });
//         setEmployees(response.data);
//       } catch (error) {
//         console.error('Error fetching employees:', error);
//       }
//     };

//     fetchEmployees();
//   }, [selectedLocation]);

//   const handleSearch = (event) => {
//     setSearchTerm(event.target.value);
//     setPage(0);
//   };

//   const handleMakeEntry = (employee) => {
//     setSelectedEmployee(employee);
//     setEmployeeCode(employee.EMPCODE || "");
//     setPunchType("");
//     setSelectedTime("");
//     setModalOpen(true);
//   };

//   const handleModalClose = () => {
//     setModalOpen(false);
//   };

//   const handlePunchTypeChange = (event) => {
//     setPunchType(event.target.value);
//   };

//   const handleTimeChange = (event) => {
//     setSelectedTime(event.target.value);
//   };

//   const handleDateChange = (event) => {
//     setSelectedDate(event.target.value);
//   };

//   const handleModalSubmit = () => {
//     const entryData = {
//       employeeCode,
//       punchType,
//       selectedTime,
//       selectedDate,
//     };

//     console.log("Data to Post:", entryData);

//     // Log MongoDB query information
//     console.log("MongoDB Query:", {
//       method: "POST",
//       url: "http://localhost:7789/api/entries",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(entryData),
//     });

//     fetch("http://localhost:7789/api/entries", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(entryData),
//     })
//       .then((response) => {
//         if (response.status === 201) {
//           return response.json();
//         } else if(response.status===500){
//           throw new Error(`HTTP error! Status: ${response.status}`)
//         } else {
//           throw new Error(`HTTP error! Status: ${response.status}`);
//         }
//       })
//       .then((data) => {
//         console.log("Server response:", data);
//         toast.success("Successfully logged!");
//         handleModalClose();
//       })
//       .catch((error) => {
//         console.error("Error submitting entry:", error);
//         toast.error("Failed to submit entry. Please try again.");
//       });
//   };

//   const handleChangePage = (event, newPage) => {
//     setPage(newPage);
//   };

//   const handleChangeRowsPerPage = (event) => {
//     setRowsPerPage(parseInt(event.target.value, 10));
//     setPage(0);
//   };

//   return (
//     <div className="manualentry">
//       <div className="pageheader">
//         <h3>Manual Attendance Entry</h3>
//       </div>
//       <div className="inputsearch">

//           <label>  </label>
//           {/* Location: */}
//           <Select
//             value={selectedLocation}
//             onChange={(e) => setSelectedLocation(e.target.value)}
//             style={{ height: '6 rem', marginRight: "10px",backgroundColor:"white" }}
//             variant="outlined"
//             displayEmpty
//           >
//             <MenuItem value="" disabled>
//               All Locations
//             </MenuItem>
//             {locationOptions.map((location) => (
//               <MenuItem key={location} value={location}>
//                 {location}
//               </MenuItem>
//             ))}
//           </Select>
        
//         {/* <label>Employee Name</label> */}
//         <TextField
//           type="text"
//           variant="outlined"
//           placeholder="Search by name or Emp id"
//           value={searchTerm}
//           onChange={handleSearch}
//           style={{
//             backgroundColor: "white",
//             color: "black",
//           }}
//         />
//         <button onClick={handleReset}
//         variant="contained"
//             color="default"
//             className="reset-button"
//             style={{
//               marginLeft:"20px",borderRadius:"5px",border:"none",color:"white"
//             }}>Reset</button>
        

//       </div>
//       <TableContainer style={{fontSize:"11px"}}>
//         <Table className="tabledata" style={{ margin: "0 auto", width: "90%", border: "1px solid #ccc" }}>
//           <TableHead>
//             <TableRow style={{ textAlign:"center"}}>
//               <TableCell style={tableCellStyle}>S.No</TableCell>
//               <TableCell style={tableCellStyle}>EMPCODE</TableCell>
//               <TableCell style={tableCellStyle}>NAME</TableCell>
//               <TableCell style={tableCellStyle}>DESIGNATION</TableCell>
//               <TableCell style={tableCellStyle}>ACTION</TableCell>
//             </TableRow>
//           </TableHead>
//           <TableBody>
//             {employees
//               .filter((employee) => {
//                 const fullName = `${employee.Name || ""} ${employee.EMPCODE || ""} ${employee.Current_Designation || ""}`;
//                 return fullName.toLowerCase().includes(searchTerm.toLowerCase());
//               })
//               .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
//               .map((employee, index) => (
                
//                 <TableRow key={employee._id}>
//   <TableCell style={{ padding: "5px" }}>{page * rowsPerPage + index + 1}</TableCell>
//   <TableCell style={{ padding: "5px" }}>{employee.EMPCODE || ""}</TableCell>
//   <TableCell style={{ padding: "5px" }}>{employee.Name || ""}</TableCell>
//   <TableCell style={{ padding: "5px" }}>{employee.Current_Designation || ""}</TableCell>
//   <TableCell style={{ padding: "5px" }}>
//     <Button
//       onClick={() => handleMakeEntry(employee)}
//       variant="contained"
//       color="primary"
//       className="search-button"
//       style={{
//         width: "150px",
//         backgroundColor: 'white',
//         border: "1px solid #DB252A",
//         color: '#DB252A',
//       }}
//     >
//       Make Entry
//     </Button>
//   </TableCell>
// </TableRow>

//               ))}
//           </TableBody>
//         </Table>
//       </TableContainer>
//       <TablePagination
//         rowsPerPageOptions={[5, 10, 25]}
//         component="div"
//         count={employees.length}
//         rowsPerPage={rowsPerPage}
//         page={page}
//         onPageChange={handleChangePage}
//         onRowsPerPageChange={handleChangeRowsPerPage}
//       />

//       <Modal
//         open={modalOpen}
//         onClose={handleModalClose}
//         aria-labelledby="modal-modal-title"
//         aria-describedby="modal-modal-description"
//       >
//         <Box sx={style}>
//           <h2 className="ModalHeading">Make Entry</h2>
//           <p>Employee Name: {selectedEmployee?.Name || ""}</p>
//           <p>Employee Code: {selectedEmployee?.EMPCODE || ""}</p>
//           <p>Designation: {selectedEmployee?.Current_Designation || ""}</p>
//           <FormControl>
//             <InputLabel id="punchTypeLabel">Punch Type</InputLabel>
//             <Select
//               labelId="punchTypeLabel"
//               id="punchType"
//               style={{ width: "200px" }}
//               value={punchType}
//               onChange={handlePunchTypeChange}
//             >
//               <MenuItem value="PunchIn">Punch In</MenuItem>
//               <MenuItem value="PunchOut">Punch Out</MenuItem>
//             </Select>
//           </FormControl>
//           <TextField
//             type="time"
//             label="Select Time"
//             style={{ width: "200px" }}
//             value={selectedTime || currentTime}
//             onChange={handleTimeChange}
//           />
//           <TextField
//             type="date"
//             label=""
//             InputLabelProps={{ shrink: false }}
//             style={{ width: "200px" }}
//             value={selectedDate}
//             onChange={handleDateChange}
//             inputProps={{ max: getCurrentDate() }}  
//           />
//           <div style={{ marginTop: "10px" }}>
//             <Button
//               variant="contained"
//               color="primary"
//               onClick={handleModalSubmit}
//               style={{
//                 width: "150px",
//                 backgroundColor: '#DB252A',
//                 border: "1px solid #DB252A",
//                 color: "white"
//               }}
//             >
//               Submit
//             </Button>
//             <Button onClick={handleModalClose}>Cancel</Button>
//           </div>
//         </Box>
//       </Modal>
//       <Toaster position="top-right" />
//     </div>
//   );
// };

// export default ManualEntry;
