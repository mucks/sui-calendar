import { ConnectButton } from '@suiet/wallet-kit';
import { Fragment } from 'react';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import Home from './pages/Home';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'


const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});


function App() {
  return (
    <Fragment>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <ThemeProvider theme={darkTheme}>
          <CssBaseline />
          <main>
            <div style={{ float: 'right' }}>
              <ConnectButton />
            </div>
            <Home />
          </main>
        </ThemeProvider>
      </LocalizationProvider>
    </Fragment>
  );
}


export default App
