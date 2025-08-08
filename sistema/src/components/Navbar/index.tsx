import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import MenuItem from './MenuItem';
import './styles.css';

// Navbar recebe a prop menuUpdateTrigger
const Navbar = ({ menuUpdateTrigger }) => {
    const [menus, setMenus] = useState([]);
    const [openMenus, setOpenMenus] = useState([]);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const navigate = useNavigate();
    const navbarRef = useRef(null);

    const fetchMenus = async () => {
        // ... (lógica de autenticação e busca de menus)
        let user = {};
        let token = '';
        try {
            token = localStorage.getItem('token');
            const userString = localStorage.getItem('user');
            if (userString && userString !== 'undefined') {
                user = JSON.parse(userString);
            } else {
                localStorage.clear();
                navigate('/');
                return;
            }
        } catch (error) {
            console.error("Erro ao ler dados do localStorage:", error);
            localStorage.clear();
            navigate('/');
            return;
        }
        if (!user.id || !token) {
            navigate('/');
            return;
        }
        try {
            const response = await fetch(`http://localhost:3001/api/admin/menu/user/${user.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    localStorage.clear();
                    navigate('/');
                }
                throw new Error('Falha ao carregar menus');
            }
            const menuData = await response.json();
            setMenus(menuData);
        } catch (error) {
            console.error("Erro ao buscar menus:", error);
        }
    };

    useEffect(() => {
        fetchMenus();
    }, [navigate, menuUpdateTrigger]); // Adicione 'menuUpdateTrigger' aqui

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (navbarRef.current && !navbarRef.current.contains(event.target)) {
                setOpenMenus([]);
                setIsMobileMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [navbarRef, setOpenMenus, setIsMobileMenuOpen]);

    const handleMenuClick = (menuId) => {
        setOpenMenus(prevOpenMenus => {
            if (prevOpenMenus.includes(menuId)) {
                const index = prevOpenMenus.indexOf(menuId);
                return prevOpenMenus.slice(0, index);
            } else {
                const menuClicked = menus.find(m => m.id === menuId);
                if (menuClicked && menuClicked.parent_id === null) {
                    return [menuId];
                }
                const path = findMenuPath(menus, menuId);
                if (path) {
                    return path;
                }
                return [...prevOpenMenus, menuId];
            }
        });
    };
    
    const findMenuPath = (allMenus, targetId, currentPath = []) => {
      for (const menu of allMenus) {
        const newPath = [...currentPath, menu.id];
        if (menu.id === targetId) {
          return newPath;
        }
        if (menu.children && menu.children.length > 0) {
          const foundPath = findMenuPath(menu.children, targetId, newPath);
          if (foundPath) {
            return foundPath;
          }
        }
      }
      return null;
    };
    
    const toggleMobileMenu = () => {
      setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    return (
        <nav className="navbar" ref={navbarRef}>
            <div className="navbar-brand">Sistema</div>
            <div className="hamburger-icon" onClick={toggleMobileMenu}>
                <div className="bar"></div>
                <div className="bar"></div>
                <div className="bar"></div>
            </div>
            <ul className={`navbar-menu ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
                {menus.map((menu) => (
                    <MenuItem 
                        key={menu.id} 
                        menu={menu} 
                        openMenus={openMenus}
                        handleMenuClick={handleMenuClick}
                    />
                ))}
            </ul>
        </nav>
    );
};

export default Navbar;