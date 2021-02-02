import React from 'react';
import { useLocation, Link as RouterLink } from 'react-router-dom';
import { RiAddFill, RiInformationLine } from 'react-icons/ri';
import { Box, Flex, Button, Icon, Tooltip } from '@chakra-ui/react';
import { useInjectedProvider } from '../contexts/InjectedProviderContext';
import { getCopy } from '../utils/metadata';
import UserAvatar from './userAvatar';
import { useOverlay } from '../contexts/OverlayContext';

const Header = ({ dao }) => {
  const location = useLocation();
  const { setHubAccountModal, setDaoAccountModal } = useOverlay();
  const { injectedChain, address, requestWallet } = useInjectedProvider();

  const daoConnectedAndWrongChain = () => {
    return dao?.chainID && injectedChain?.chainId !== dao?.chainID;
  };

  const WrongNetworkToolTip = ({ children }) => {
    const withToolTip = (
      <Tooltip
        hasArrow
        label='Please change networks in your wallet to interact with this DAO.'
        bg='secondary.500'
        placement='left-start'
      >
        {children}
      </Tooltip>
    );
    return daoConnectedAndWrongChain() ? withToolTip : children;
  };

  const getHeading = () => {
    switch (location.pathname) {
      case '/':
        return 'Hub';
      case '/explore':
        return 'Explore DAOs';
      case '/summon':
        return 'Summon';
      case `/dao/${dao.chainID}/${dao.daoID}`:
        return 'Overview';
      case `/dao/${dao.chainID}/${dao.daoID}/proposals`:
        return getCopy(dao.daoMetaData, 'proposals');
      case `/dao/${dao.chainID}/${dao.daoID}/bank`:
        return getCopy(dao.daoMetaData, 'bank');
      case `/dao/${dao.chainID}/${dao.daoID}/members`:
        return getCopy(dao.daoMetaData, 'members');
      case `/dao/${dao.chainID}/${dao.daoID}/boosts`:
        return 'Boosts';
      case `/dao/${dao.chainID}/${dao.daoID}/settings`:
        return 'Settings';
      case `/dao/${dao.chainID}/${dao.daoID}/profile/${address}`:
        return 'Settings';
      case `/dao/${dao.chainID}/${dao.daoID}/proposals/new/`:
        return `New ${getCopy('proposal')}`;
    }
  };
  const getHeaderElement = () => {
    if (location.pathname === `/` && address) {
      return (
        <Button
          as='a'
          href='https://3box.io/hub'
          target='_blank'
          variant='outline'
        >
          Edit 3Box Profile
        </Button>
      );
    } else if (
      location.pathname === `/dao/${dao?.chainID}/${dao?.daoID}/proposals` &&
      address
    ) {
      return (
        <Button
          as={RouterLink}
          to={`/dao/${dao?.chainID}/${dao?.daoID}/proposals/new`}
          rightIcon={<RiAddFill />}
        >
          New {getCopy(dao?.daoMetaData, 'proposal')}
        </Button>
      );
    } else if (
      location.pathname === `/dao/${dao?.chainID}/${dao?.daoID}/members` &&
      address &&
      dao.daoMember
    ) {
      return (
        <Button
          as={RouterLink}
          to={`/dao/${dao?.chainID}/${dao?.daoID}/proposals/new/member`}
        >
          Apply
        </Button>
      );
    } else if (
      location.pathname === `/dao/${dao?.chainID}/${dao?.daoID}/bank` &&
      address
    ) {
      <Button
        as={RouterLink}
        to={`/dao/${dao?.chainID}/${dao?.daoID}/proposals/new/whitelist`}
        rightIcon={<RiAddFill />}
      >
        Add Asset
      </Button>;
    }
  };

  const toggleAccountModal = () => {
    if (!dao) {
      setHubAccountModal((prevState) => !prevState);
    } else {
      setDaoAccountModal((prevState) => !prevState);
    }
  };

  return (
    <Flex direction='row' justify='space-between' p={6}>
      <Flex
        direction='row'
        justify={['space-between', null, null, 'flex-start']}
        align='center'
        w={['100%', null, null, 'auto']}
      >
        <Box
          fontSize={['lg', null, null, '3xl']}
          color='#ffffff'
          fontFamily='heading'
          fontWeight={700}
          mr={10}
        >
          {getHeading()}
        </Box>
        {getHeaderElement()}
      </Flex>
      <Flex
        direction='row'
        justify='flex-end'
        align='center'
        d={['none', null, null, 'flex']}
      >
        <WrongNetworkToolTip>
          <Flex
            align='center'
            mr={5}
            background={daoConnectedAndWrongChain() && 'secondary.500'}
            p='5px 12px'
            borderRadius='20px'
          >
            {daoConnectedAndWrongChain() && (
              <Icon as={RiInformationLine} mr={2} />
            )}
            <Box
              fontSize='md'
              as={daoConnectedAndWrongChain() && 'i'}
              fontWeight={daoConnectedAndWrongChain() ? 600 : 200}
            >
              {injectedChain?.name}
            </Box>
          </Flex>
        </WrongNetworkToolTip>

        {address ? (
          <Button variant='outline' onClick={toggleAccountModal}>
            <UserAvatar copyEnabled={false} />
          </Button>
        ) : (
          <Button variant='outline' onClick={requestWallet}>
            Connect Wallet
          </Button>
          // <Web3SignIn />
        )}
      </Flex>
    </Flex>
  );
};
export default Header;
// const getTitle = () => {
//   if (location.pathname === "/") {
//     setPageTitle("Hub");
//   } else if (location.pathname === `/explore`) {
//     setPageTitle("Explore DAOs");
//   } else if (location.pathname === `/dao/${dao?.address}`) {
//     setPageTitle("Overview");
//   } else if (location.pathname === `/dao/${dao?.address}/proposals`) {
//     setPageTitle(theme.daoMeta.proposals);
//     // TODO proposals id regex
//   } else if (location.pathname === `/dao/${dao?.address}/proposals`) {
//     setPageTitle(theme.daoMeta.proposals);
//   } else if (
//     location.pathname === `/dao/${dao?.address}/proposals/new/member`
//   ) {
//     setPageTitle(
//       "New " + theme.daoMeta.member + " " + theme.daoMeta.proposal
//     );
//   } else if (location.pathname === `/dao/${dao?.address}/proposals/new`) {
//     setPageTitle(`New ${theme.daoMeta.proposal}`);
//   } else if (location.pathname === `/dao/${dao?.address}/members`) {
//     setPageTitle(theme.daoMeta.members);
//   } else if (location.pathname === `/dao/${dao?.address}/bank`) {
//     setPageTitle(theme.daoMeta.bank);
//   } else if (location.pathname === `/dao/${dao?.address}/settings`) {
//     setPageTitle("Settings");
//   } else if (location.pathname === `/dao/${dao?.address}/settings/meta`) {
//     setPageTitle("Metadata");
//   } else if (location.pathname === `/dao/${dao?.address}/settings/theme`) {
//     setPageTitle("Theme");
//   } else if (
//     location.pathname === `/dao/${dao?.address}/settings/notifications`
//   ) {
//     setPageTitle("Notifications");
//   } else if (location.pathname === `/dao/${dao?.address}/settings/boosts`) {
//     setPageTitle(theme.daoMeta.boosts);
//   } else if (
//     location.pathname === `/dao/${dao?.address}/settings/boosts/new`
//   ) {
//     setPageTitle("New " + theme.daoMeta.boost);
//   } else if (
//     location.pathname === `/themeSample` ||
//     location.pathname === `/theme`
//   ) {
//     setPageTitle("Theme Samples");
//   } else if (
//     location.pathname === `/dao/${dao?.address}/profile/${user?.username}`
//   ) {
//     setPageTitle(`${theme.daoMeta.member} Profile`);
//   } else {
//     // TODO pull from graph data
//     setPageTitle(dao?.apiMeta?.name);
//   }
//   // eslint-disable-next-line react-hooks/exhaustive-deps
// }