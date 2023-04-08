import { Backdrop, CircularProgress } from "@mui/material";

export default function LoadingOverlay({ open }: { open: boolean }) {
    return <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => 12000 }}
        open={open}
    >
        <CircularProgress color="inherit" />
    </Backdrop>
}