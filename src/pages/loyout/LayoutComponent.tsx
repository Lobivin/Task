import { ReactNode, useState, useMemo } from 'react';
import {
    Box,
    Drawer,
    AppBar,
    Toolbar,
    Typography,
    Divider,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    IconButton,
    Avatar,
    Menu,
    MenuItem,
    Chip,
} from '@mui/material';
import {
    Collections as CollectionsIcon,
    Settings as SettingsIcon,
    Logout as LogoutIcon,
    AccountCircle,
    Menu as MenuIcon,
    Brightness4 as Brightness4Icon,
    Brightness7 as Brightness7Icon,
} from '@mui/icons-material';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';
import { ThemeProvider, createTheme } from '@mui/material/styles';

const drawerWidth = 280;

interface LayoutProps {
    children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [darkMode, setDarkMode] = useState(false);
    const {  logout } = useAuth();
    const router = useRouter();
    const userName = 'Seçil Store';
    const userEmail = 'info@secilstore.com';
    const theme = useMemo(
        () =>
            createTheme({
                palette: {
                    mode: darkMode ? 'dark' : 'light',
                },
            }),
        [darkMode]
    );

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleProfileMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = async () => {
        try {
            await logout();
            router.push('/login');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            handleProfileMenuClose();
        }
    };

    const menuItems = [
        { text: 'Koleksiyonlar', icon: <CollectionsIcon />, path: '/collections' },
    ];

    const getPageTitle = () => {
        switch (router.pathname) {
            case '/collections':
                return 'Koleksiyonlar';
            case '/collections/[id]/edit':
                return 'Koleksiyon Düzenle';
            case '/dashboard':
                return 'Ana Sayfa';
            case '/filters':
                return 'Filtreler';
            case '/settings':
                return 'Ayarlar';
            default:
                return 'Koleksiyon Yönetimi';
        }
    };

    const drawer = (
        <div>
            <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    Koleksiyon Yönetimi
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    v1.0.0
                </Typography>
            </Box>

            <Divider />

            {/* User Info */}
            <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                    {userName.charAt(0)}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'medium' }} noWrap>
                        {userName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap>
                        {userEmail}
                    </Typography>
                </Box>
            </Box>

            <Divider />

            <List sx={{ px: 1, py: 2 }}>
                {menuItems.map((item) => (
                    <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                        <ListItemButton
                            onClick={() => router.push(item.path)}
                            selected={router.pathname === item.path || router.pathname.startsWith(item.path)}
                            sx={{
                                borderRadius: 2,
                                mx: 1,
                                '&.Mui-selected': {
                                    bgcolor: 'primary.main',
                                    color: 'white',
                                    '& .MuiListItemIcon-root': {
                                        color: 'white',
                                    },
                                    '&:hover': {
                                        bgcolor: 'primary.dark',
                                    },
                                },
                                '&:hover': {
                                    bgcolor: 'grey.100',
                                },
                            }}
                        >
                            <ListItemIcon sx={{ minWidth: 40 }}>
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText
                                primary={item.text}
                                primaryTypographyProps={{ variant: 'body2', fontWeight: 'medium' }}
                            />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>

            <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, p: 2 }}>
                <Divider sx={{ mb: 2 }} />
                <ListItemButton
                    onClick={handleLogout}
                    sx={{
                        borderRadius: 2,
                        color: 'error.main',
                        '&:hover': {
                            bgcolor: 'error.50',
                        },
                    }}
                >
                    <ListItemIcon sx={{ minWidth: 40, color: 'error.main' }}>
                        <LogoutIcon />
                    </ListItemIcon>
                    <ListItemText
                        primary="Çıkış Yap"
                        primaryTypographyProps={{ variant: 'body2', fontWeight: 'medium' }}
                    />
                </ListItemButton>
            </Box>
        </div>
    );

    return (
        <ThemeProvider theme={theme}>
            <Box sx={{ display: 'flex' }}>
                {/* App Bar */}
                <AppBar
                    position="fixed"
                    sx={{
                        width: { sm: `calc(100% - ${drawerWidth}px)` },
                        ml: { sm: `${drawerWidth}px` },
                        bgcolor: 'background.paper',
                        color: 'text.primary',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
                    }}
                >
                    <Toolbar>
                        <IconButton
                            color="inherit"
                            aria-label="open drawer"
                            edge="start"
                            onClick={handleDrawerToggle}
                            sx={{ mr: 2, display: { sm: 'none' } }}
                        >
                            <MenuIcon />
                        </IconButton>

                        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 'medium' }}>
                            {getPageTitle()}
                        </Typography>

                        {/* Tema Değiştirici */}
                        <IconButton sx={{ mr: 2 }} onClick={() => setDarkMode((prev) => !prev)} color="inherit">
                            {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
                        </IconButton>

                        <Chip
                            label="Aktif"
                            color="success"
                            size="small"
                            sx={{ mr: 2, display: { xs: 'none', sm: 'flex' } }}
                        />

                        <IconButton
                            size="large"
                            edge="end"
                            aria-label="account of current user"
                            aria-haspopup="true"
                            onClick={handleProfileMenuOpen}
                            color="inherit"
                        >
                            <AccountCircle />
                        </IconButton>
                    </Toolbar>
                </AppBar>

                {/* Profile Menu */}
                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleProfileMenuClose}
                    onClick={handleProfileMenuClose}
                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                >
                    <MenuItem onClick={() => router.push('/profile')}>
                        <ListItemIcon>
                            <AccountCircle fontSize="small" />
                        </ListItemIcon>
                        Profil
                    </MenuItem>
                    <MenuItem onClick={() => router.push('/settings')}>
                        <ListItemIcon>
                            <SettingsIcon fontSize="small" />
                        </ListItemIcon>
                        Ayarlar
                    </MenuItem>
                    <Divider />
                    <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                        <ListItemIcon>
                            <LogoutIcon fontSize="small" color="error" />
                        </ListItemIcon>
                        Çıkış Yap
                    </MenuItem>
                </Menu>

                {/* Sidebar */}
                <Box
                    component="nav"
                    sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
                >
                    <Drawer
                        variant="temporary"
                        open={mobileOpen}
                        onClose={handleDrawerToggle}
                        ModalProps={{
                            keepMounted: true,
                        }}
                        sx={{
                            display: { xs: 'block', sm: 'none' },
                            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                        }}
                    >
                        {drawer}
                    </Drawer>
                    <Drawer
                        variant="permanent"
                        sx={{
                            display: { xs: 'none', sm: 'block' },
                            '& .MuiDrawer-paper': {
                                boxSizing: 'border-box',
                                width: drawerWidth,
                                borderRight: '1px solid #e0e0e0',
                            },
                        }}
                        open
                    >
                        {drawer}
                    </Drawer>
                </Box>

                {/* Main Content */}
                <Box
                    component="main"
                    sx={{
                        flexGrow: 1,
                        p: 3,
                        width: { sm: `calc(100% - ${drawerWidth}px)` },
                        mt: '64px',
                        bgcolor: 'background.default',
                        minHeight: 'calc(100vh - 64px)',
                        transition: 'background-color 0.2s',
                    }}
                >
                    {children}
                </Box>
            </Box>
        </ThemeProvider>
    );
}