import React from 'react';
import * as fcl from "@onflow/fcl";
import Footer from '../components/Footer';
import realestate from "../data/realestate.json";

const Buy = () => {
  const handleBuy = async (estate) => {
    try {
      const transactionId = await fcl.mutate({
        cadence: `
          import NFTStorefrontV2 from 0x2d55b98eb200daef
          import NonFungibleToken from 0x631e88ae7f1d7c20
          import FungibleToken from 0x9a0766d93b6608b7

          transaction(listingResourceID: UInt64) {
            let storefront: &NFTStorefrontV2.Storefront{NFTStorefrontV2.StorefrontPublic}
            let paymentVault: @FungibleToken.Vault

            prepare(acct: AuthAccount) {
              self.storefront = acct.borrow<&NFTStorefrontV2.Storefront{NFTStorefrontV2.StorefrontPublic}>(from: /storage/NFTStorefrontV2)
                ?? panic("Could not borrow reference to the storefront")
              self.paymentVault <- acct.borrow<&FungibleToken.Vault>(from: /storage/flowTokenVault)!.withdraw(amount: 10.0)
            }

            execute {
              let listing = self.storefront.borrowListing(listingResourceID: listingResourceID)
                ?? panic("Could not borrow listing")
              listing.purchase(payment: <-self.paymentVault, commissionRecipient: nil)
            }
          }
        `,
        args: (arg, t) => [
          arg(estate.listingResourceID, t.UInt64)
        ],
        proposer: fcl.currentUser().authorization,
        payer: fcl.currentUser().authorization,
        authorizations: [fcl.currentUser().authorization],
        limit: 100
      });
      console.log("Transaction ID:", transactionId);
    } catch (error) {
      console.error("Error purchasing property:", error);
    }
  };

  return (
    <>
      <div className='w-full mt-14 flex items-center justify-center'>
        <div className='w-10/12 flex flex-col items-start justify-center'>
          <div className='w-full flex flex-col items-start justify-start gap-8'>
            <div className='flex flex-col items-start justify-start gap-2'>
              <p className='text-4xl font-semibold'>Buy Properties</p>
              <p className='text-4xl font-semibold text-blue-900'>Without any headache</p>
            </div>
            <p className='text-lg text-gray-500'>Browse Latest Estates</p>
          </div>

          <div className='w-full grid grid-cols-3 gap-x-5 gap-y-8 mt-14'>
            {
              [...realestate].reverse().map((estate, index) => {
                return (
                  <div key={index} className='border-4 w-80 h-96 rounded-2xl flex flex-col items-center justify-around hover:border-gray-400'>
                    <img src={estate.property_image} alt={estate.property_name} className='w-30 h-32' />
                    <div className='flex flex-col items-center justify-center gap-y-1 px-2'>
                      <p className='text-2xl font-semibold'>{estate.property_name}</p>
                      <p className='text-lg text-gray-500'>{estate.property_location}</p>
                      <p className='text-sm text-gray-500 font-light text-center'>{estate.property_description}</p>
                    </div>
                    <div className='w-11/12 flex items-center justify-center gap-x-2'>
                      <div className='flex items-center justify-center w-4/12 h-10 rounded-lg border'>{estate.property_price}</div>
                      <button
                        className='flex items-center justify-center w-8/12 h-10 rounded-lg bg-blue-700 text-white border'
                        onClick={() => handleBuy(estate)}
                      >
                        Buy
                      </button>
                    </div>
                  </div>
                )
              })
            }
          </div>
        </div>
      </div>
      <Footer classes={""} />
    </>
  );
};

export default Buy;