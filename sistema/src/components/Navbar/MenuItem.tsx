import React from 'react';
import { Link } from 'react-router-dom';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

// Altere a prop de `openMenuId` para `openMenus`
const MenuItem = ({ menu, openMenus, handleMenuClick }) => {
  const hasChildren = menu.children && menu.children.length > 0;
  // Agora, a abertura do menu é determinada se seu ID está no array
  const isOpen = openMenus.includes(menu.id);

  const handleItemClick = (e) => {
    // Apenas links filhos devem navegar. Itens com filhos apenas alternam o menu.
    if (hasChildren) {
      e.preventDefault();
      handleMenuClick(menu.id);
    } else {
      // Ao clicar em um nó folha, fechamos todos os menus
      handleMenuClick(null);
    }
  };

  return (
    <li className={`menu-item ${hasChildren ? 'has-children' : ''}`}>
      {hasChildren ? (
        <div onClick={handleItemClick} className="parent-link">
          {menu.name}
          <ArrowDropDownIcon className={`arrow-icon ${isOpen ? 'open' : ''}`} />
        </div>
      ) : (
        <Link to={menu.route} onClick={handleItemClick}>{menu.name}</Link>
      )}
      
      {hasChildren && (
        <ul className={`submenu ${isOpen ? 'open' : ''}`}>
          {menu.children.map((childMenu) => (
            <MenuItem 
                key={childMenu.id} 
                menu={childMenu} 
                // Passa o array e a função para os filhos
                openMenus={openMenus}
                handleMenuClick={handleMenuClick}
            />
          ))}
        </ul>
      )}
    </li>
  );
};

export default MenuItem;