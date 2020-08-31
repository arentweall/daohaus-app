import React, { useContext, useState, useEffect } from 'react';
import { withRouter } from 'react-router-dom';
import styled from 'styled-components';

import { Formik, Form, Field, ErrorMessage } from 'formik';
import { FormContainer, FieldContainer } from '../../App.styles';

import {
  LoaderContext,
  DaoServiceContext,
  CurrentUserContext,
  Web3ConnectContext,
  DaoDataContext,
} from '../../contexts/Store';
import Loading from '../shared/Loading';

import { TokenService } from '../../utils/TokenService';
import { GET_MOLOCH } from '../../utils/Queries';
import { useQuery } from 'react-apollo';

const H2Arrow = styled.h2`
  text-align: center;
  color: ${(props) => props.theme.primary};
`;

const TransmutationForm = (props) => {
  const { history, transmutationService } = props;

  const [gloading] = useContext(LoaderContext);
  const [formLoading, setFormLoading] = useState(false);
  const [balance, setBalance] = useState(0);
  const [daoService] = useContext(DaoServiceContext);
  const [currentUser] = useContext(CurrentUserContext);
  const [web3Connect] = useContext(Web3ConnectContext);
  const [daoData] = useContext(DaoDataContext);
  const [tokenData, setTokenData] = useState([]);

  console.log('daoData', daoData);

  const options = {
    variables: { contractAddr: daoData.contractAddress },
    fetchPolicy: 'no-cache',
  };
  const query = GET_MOLOCH;

  const { loading, error, data } = useQuery(query, options);

  const displayTribute = (val) => {
    return web3Connect.web3.utils.fromWei('' + val);
  };

  const submitProposal = async (paymentRequested, applicant, description) => {
    return transmutationService.propose(
      applicant,
      paymentRequested,
      description,
    );
  };

  useEffect(() => {
    const getBalance = async () => {
      const token = await transmutationService.giveToken();

      const tokenService = new TokenService(web3Connect.web3, token);

      const balance = await tokenService.balanceOf(
        transmutationService.setupValues.transmutation,
      );

      console.log('balance', web3Connect.web3.utils.fromWei(balance));
      setBalance(web3Connect.web3.utils.fromWei(balance));
    };
    getBalance();

    // eslint-disable-next-line
  }, [web3Connect.web3]);

  // get getToken
  useEffect(() => {
    const getTokenBalance = async () => {
      const getTokenAddress = await transmutationService.getToken();
      console.log('getTokenAddress', getTokenAddress);
      const tokenArray = data.moloch.tokenBalances.filter(
        (token) =>
          token.token.tokenAddress === getTokenAddress.toLowerCase() &&
          token.guildBank,
      );

      if (!tokenArray) {
        setTokenData([]);
        return;
      }
      console.log('tokenArray', tokenArray);
      setTokenData(
        tokenArray.map((token) => ({
          label: token.token.symbol || token.tokenAddress,
          value: token.token.tokenAddress,
          decimals: token.token.decimals,
          balanceWei: token.tokenBalance,
          balance: web3Connect.web3.utils.fromWei(token.tokenBalance),
        })),
      );
    };
    if (data && data.moloch) {
      getTokenBalance();
    }
    // eslint-disable-next-line
  }, [data, web3Connect]);

  if (loading) return <Loading />;
  if (error) {
    console.log('error', error);
  }

  return (
    <FormContainer>
      <h1>Transmutation Proposal</h1>
      <div>
        {formLoading && <Loading />}
        {gloading && <Loading />}

        <div>
          {currentUser && currentUser.username ? (
            <Formik
              initialValues={{
                description: '',
                applicant: '',
                paymentRequested: '',
              }}
              onSubmit={async (values, { setSubmitting }) => {
                console.log('submit', values);
                setFormLoading(true);
                setSubmitting(true);
                try {
                  await submitProposal(
                    values.paymentRequested,
                    values.applicant,
                    values.description,
                  );
                  setSubmitting(false);
                  setFormLoading(false);
                  history.push(`/dao/${daoService.daoAddress}/success`);
                } catch (err) {
                  setSubmitting(false);
                  setFormLoading(false);
                  console.log('Error:', err);
                }
              }}
            >
              {({ isSubmitting, setFieldValue, ...props }) => (
                <Form className="Form">
                  <Field name="description">
                    {({ field, form }) => (
                      <FieldContainer
                        className={
                          field.value || field.value === 0
                            ? 'Field HasValue'
                            : 'Field '
                        }
                      >
                        <label>Short Description</label>
                        <textarea rows="5" {...field} />
                      </FieldContainer>
                    )}
                  </Field>
                  <ErrorMessage name="description">
                    {(msg) => <div className="Error">{msg}</div>}
                  </ErrorMessage>

                  <Field name="applicant">
                    {({ field, form }) => (
                      <FieldContainer
                        className={field.value ? 'Field HasValue' : 'Field '}
                      >
                        <label>Applicant Address</label>
                        <input type="text" {...field} />
                      </FieldContainer>
                    )}
                  </Field>
                  <ErrorMessage name="applicant">
                    {(msg) => <div className="Error">{msg}</div>}
                  </ErrorMessage>

                  <Field name="paymentRequested">
                    {({ field, form }) => (
                      <FieldContainer
                        className={field.value ? 'Field HasValue' : 'Field '}
                      >
                        <label>Get Amount</label>
                        <input type="text" {...field} />
                      </FieldContainer>
                    )}
                  </Field>
                  <ErrorMessage name="paymentRequested">
                    {(msg) => <div className="Error">{msg}</div>}
                  </ErrorMessage>

                  <ErrorMessage name="paymentRequested">
                    {(msg) => <div className="Error">{msg}</div>}
                  </ErrorMessage>
                  <p>
                    Max {tokenData[0] && tokenData[0].balance.substring(0, 6)}
                  </p>
                  {tokenData[0] && (
                    <p
                      onClick={() => {
                        setFieldValue('paymentRequested', tokenData[0].balance);
                      }}
                    >
                      use max
                    </p>
                  )}
                  <H2Arrow>↓</H2Arrow>

                  <h2>Balance in transmutation contract: {balance}</h2>
                  <h2>
                    Exchange Rate:{' '}
                    {transmutationService.setupValues.exchangeRate}
                  </h2>
                  <h2>
                    {displayTribute(
                      transmutationService
                        .calcTribute(props.values.paymentRequested)
                        .toString(),
                    )}
                  </h2>

                  <button type="submit" disabled={isSubmitting}>
                    Submit
                  </button>
                </Form>
              )}
            </Formik>
          ) : (
            <Loading />
          )}
        </div>
      </div>
    </FormContainer>
  );
};

export default withRouter(TransmutationForm);
