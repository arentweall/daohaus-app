import React, { useEffect } from 'react';
import { RiArrowDropDownFill } from 'react-icons/ri';
import {
  Box,
  HStack,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Flex,
  Icon,
} from '@chakra-ui/react';

const ListSort = ({ sort, setSort, options }) => {
  useEffect(() => {
    setSort(options[0]);
  }, []);

  return (
    <Flex direction='row' mb={[3, null, null, 0]} justifyContent='flex-end'>
      <Box
        mr={3}
        textTransform='uppercase'
        fontFamily='heading'
        fontSize={['sm', null, null, 'md']}
      >
        Sort By
      </Box>

      <Menu isLazy>
        <MenuButton
          as={HStack}
          textTransform='uppercase'
          fontFamily='heading'
          fontSize={['sm', null, null, 'md']}
          color='secondary.500'
          spacing={2}
          _hover={{ cursor: 'pointer' }}
        >
          {sort?.name || 'newest'}
          <Icon as={RiArrowDropDownFill} color='secondary.500' />
        </MenuButton>
        <MenuList bg='black'>
          {options.map(option => (
            <MenuItem
              key={option.value}
              onClick={() => setSort(option)}
              value={option.value}
              _active={{ color: 'primary.300' }}
              _hover={{ color: 'primary.300' }}
            >
              {option.name}
            </MenuItem>
          ))}
        </MenuList>
      </Menu>
    </Flex>
  );
};

export default ListSort;
