import React, { useEffect, useState, useContext } from 'react';
import { useQuery } from '@apollo/react-hooks';
import { ResponsiveContainer, AreaChart, Area } from 'recharts';

import { GET_METADATA } from '../../utils/Queries';
import { DaoServiceContext, DaoDataContext } from '../../contexts/Store';
import StateModals from '../../components/shared/StateModals';
import BottomNav from '../../components/shared/BottomNav';
import ErrorMessage from '../../components/shared/ErrorMessage';
import Loading from '../../components/shared/Loading';
import ValueDisplay from '../../components/shared/ValueDisplay';
import HeadTags from '../../components/shared/HeadTags';

import './Home.scss';

const Home = () => {
  const [vizData, setVizData] = useState([]);
  const [chartView, setChartView] = useState('bank');
  const [daoService] = useContext(DaoServiceContext);
  const [daoData] = useContext(DaoDataContext);

  const { loading, error, data } = useQuery(GET_METADATA, {
    pollInterval: 20000,
  });

  const getShares = async () => {
    const events = await daoService.mcDao.getAllEvents();
    const firstBlock = events[0].blockNumber;
    const minted = await daoService.mcDao.daoContract.getPastEvents(
      'ProcessProposal',
      { fromBlock: firstBlock , toBlock: 'latest' },
    );
    const burned = await daoService.mcDao.daoContract.getPastEvents(
      'Ragequit',
      { fromBlock: firstBlock , toBlock: 'latest' },
    );

    const passed = minted.filter((event) => event.returnValues.didPass)
    .map((item) => ({
      shares: item.returnValues.sharesRequested,
      blockNumber: item.blockNumber,
    }));

    const burnt = burned
    .map((item) => ({
      shares: "-"+item.returnValues.sharesToBurn,
      blockNumber: item.blockNumber,
    }));

    const sorted = passed
    .concat(burnt)
    .sort((a, b) => a.blockNumber - b.blockNumber);

  return sorted.reduce(
    (sum, item, idx) => {
      sum.push({
        shares: item.shares,
        blockNumber: item.blockNumber,
        currentShares: sum[idx].currentShares + +item.shares,
      });

      return sum;
    },
    [{ ...sorted[0], currentShares: 1 }],
  );
  };

  const getBalance = async () => {
    const deposit = await daoService.token.contract.getPastEvents('Transfer', {
      filter: { dst: data.guildBankAddr },
      fromBlock: 0,
      toBlock: 'latest',
    });
    const withdraw = await daoService.token.contract.getPastEvents('Transfer', {
      filter: { src: data.guildBankAddr },
      fromBlock: 0,
      toBlock: 'latest',
    });
    const deposits = deposit.map((item) => ({
      balance: daoService.web3.utils.fromWei(item.returnValues.wad.toString()),
      blockNumber: item.blockNumber,
    }));
    const withdraws = withdraw.map((item, idx) => ({
      balance:
        '-' + daoService.web3.utils.fromWei(item.returnValues.wad.toString()),
      blockNumber: item.blockNumber,
    }));
    const sorted = deposits
      .concat(withdraws)
      .sort((a, b) => a.blockNumber - b.blockNumber);

    return sorted.reduce(
      (sum, item, idx) => {
        sum.push({
          balance: item.balance,
          blockNumber: item.blockNumber,
          currentBalance: sum[idx].currentBalance + +item.balance,
        });

        return sum;
      },
      [{ ...sorted[0], currentBalance: 0 }],
    );
  };

  useEffect(() => {
    console.log('daoService.mcDao');
    console.log(daoService.mcDao);

    const fetchData = async () => {
      if (!data.guildBankAddr) {
        return;
      }
      console.log('token withdraw');

      console.log(
        daoService.token.contract.getPastEvents('Transfer', {
          filter: { dst: data.guildBankAddr },
          fromBlock: 0,
          toBlock: 'latest',
        }),
      );
      console.log('process prop');
      const shares = await getShares();
      console.log(shares);
      const balance = await getBalance();
      console.log(balance);



      const events = await daoService.mcDao.getAllEvents();
      const firstBlock = events[0].blockNumber;
      const latestBlock = await daoService.web3.eth.getBlock('latest');
      const blocksAlive = latestBlock.number - firstBlock;

      const blockIntervals = 10;
      const dataLength = blocksAlive / blockIntervals;

      if (chartView === 'bank') {
        setVizData(
          balance.map((balance) => ({
            x: balance.blockNumber,
            y: balance.currentBalance,
          })),
        );
      }

      if (chartView === 'shares') {
        setVizData(
          shares.map((shares) => ({
            x: shares.blockNumber,
            y: shares.currentShares,
          })),
        );
      }

      if (chartView === 'value') {
        // setVizData(
        //   shares.map((shares) => ({
        //     x: shares.blockNumber,
        //     y: shares.currentShares / balance.currentBalance,
        //   })),
        // );
      }
    };

    fetchData();
  }, [daoService, data.guildBankAddr, chartView, data.approvedToken]);

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <>
      {daoData ? <HeadTags daoData={daoData} /> : null}
      <StateModals />

      <div className="Home">
        <div className="Intro">
          <h1>{daoData.name || 'PokéMol DAO'}</h1>
          <p>{daoData.description || 'Put a Moloch in Your Pocket'}</p>
        </div>
        <div className="Chart" style={{ width: '100%', height: '33vh' }}>
          <ResponsiveContainer>
            <AreaChart data={vizData}>
              <defs>
                <linearGradient id="grade" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop
                    offset="0%"
                    stopColor="rgba(189,134,254,1)"
                    stopOpacity={1}
                  />
                  <stop
                    offset="100%"
                    stopColor="rgba(189,134,254,1)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="y"
                stroke="rgba(203,46,206,1)"
                fill="url(#grade)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="Data">
          <div
            onClick={() => setChartView('bank')}
            className={'Bank' + (chartView === 'bank' ? ' Selected' : '')}
          >
            <h5>Bank</h5>
            <h2>
              <ValueDisplay
                value={parseFloat(data.guildBankValue).toFixed(4)}
              />
            </h2>
          </div>
          <div className="Row">
            <div
              onClick={() => setChartView('shares')}
              className={'Shares' + (chartView === 'shares' ? ' Selected' : '')}
            >
              <h5>Shares</h5>
              <h3>{data.totalShares}</h3>
            </div>
            <div
              onClick={() => setChartView('value')}
              className={
                'ShareValue' + (chartView === 'value' ? ' Selected' : '')
              }
            >
              <h5>Share Value</h5>
              <h3>
                <ValueDisplay value={data.shareValue.toFixed(4)} />
              </h3>
            </div>
          </div>
        </div>
        <BottomNav />
      </div>
    </>
  );
};

export default Home;
