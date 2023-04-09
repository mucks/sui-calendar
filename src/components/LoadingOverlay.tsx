import { Backdrop, CircularProgress } from "@mui/material";

export default function LoadingOverlay({ open }: { open: boolean }) {
    // z index is set to 12000 to be above the modal
    return <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => 12000 }}
        open={open}
    >
        <CircularProgress color="inherit" />
    </Backdrop>
}