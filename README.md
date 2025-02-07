Create blockchain-powered mini apps for Line's 196M+ users using thirdweb's tools. This guide shows how to build a gasless token reward system within Line Messenger.

In this tutorial, we'll walk through the process of building a web3 LINE mini game using thirdweb's SDK. The game will be a simple rock paper scissors game where users can connect their wallet, play the game, and earn tokens for winning.

By the end of this guide, you will have a fully functioning web3 LINE mini game that allows users to:

- Connect their wallet by signing in with an email
- Play rock paper scissors against the computer
- Claim token prizes for winning games
- View their token balance and wallet address

---

Checkout the Video Tutorial Here

[[Add]]

---

**Prerequisites**

- [Line Developer Account](https://developers.line.biz/)
- thirdweb client ID
- Testnet funds on Kaia Chain
- Basic React knowledge
- Follow all region restrictions from LINE

# Step 1: Create a Line Provider

The first step is to create a Line Business ID account in order to log into the LINE Developer Console. This can be done with just an email. 

1. Create a Line Business ID Account
    
2. Login to the LINE Developer Console with your Business ID 
    
3. In the providers section click on Create 
    
4. Name your Provider and click on Create 

    
# Step 2: Create a Line Mini App Channel
    
Now, let’s create a Line Mini App Channel that will act as your mini app! 
    

1. Once your Provider is created click on Create a LINE MINI App Channel 


2. Fill in any necessary information such as which region you would like this channel to be available in, profile info, channel name, etc. 
    
    
3. Click on Create when done 


4. Once your MiniApp is created you will be shown a screen containing your mini apps information. The important info for development will be in the Web app settings tab. 

    
5. Is this section you will see a Basic Information. For developing it is important to take note of the following: 

LIFF URL : This will be used to identify your mini-app. Pay special attention to the section after [line.me/](http://line.me/) as this is your LIFF ID.
Endpoint URL : This is where your application will point to. Once you have your webapp running you can update this to point to your webapp
    

# Step3: Set up the Next.js React Project

Its time to setup your Next.js project for our mini game and web app. 

1. Open your terminal and run: 

```jsx
npx thirdweb create 
```

1. Choose a project name and select `Next.js` as the framework. 
2. Change into the project directory: `cd project-name` 
3. Open your project in your code editor 

# **Step 3: Configure the Web App as a Line Mini App**

Now, we will configure our web app to be opened as a LINE mini app when opened through the LINE app.

1. Install the `@line/liff` package either through yarn or npm
    1. 
    
    ```jsx
    npm install @line/liff
    or
    yard add @line/liff
    ```
    
2. Open the `layout.tsx` file in your project
    1. Designate the file as a `use client` at the top of the file. 
    2. Import the liff package
    
    ```jsx
    import liff from '@line/liff'; // DIRECT IMPORT of liff
    ```
    
3. Initialize the LIFF client through a use effect 
    1. Create a tracker for the LIFF state
        1. 
        
        ```jsx
          const [isLiffReady, setIsLiffReady] = useState(false); // Track LIFF readiness
        ```
        
    2. Load your liffID from your `.env` file. Remember this is taken from your LINE developer console. 
        1. 
        
        ```jsx
          const liffId = process.env.NEXT_PUBLIC_TEMPLATE_LINE_LIFF!; //USE YOUR LIFF ID
        ```
        
    3. Use a useEffect to inititialize the LIFF client. 
    
    ```jsx
    useEffect(() => {
        // Only initialize LIFF on the client-side
        if (typeof window !== 'undefined') {
          const initializeLiff = async () => {
            try {
              await liff.init({ liffId: liffId });
              console.log('LIFF initialized successfully!');
              setIsLiffReady(true); // Set state to indicate LIFF is ready
            } catch (error) {
              console.error('LIFF initialization failed', error);
            }
          };
    
          initializeLiff();
        }
      }, [liffId]);
    ```
    
4. Wrap your <ThirdwebProvider> with the Liff Client Status
    1. 
    
    ```jsx
    return (
        <html lang="en">
          <body className={inter.className}>
            {isLiffReady ? (
              <ThirdwebProvider>{children}</ThirdwebProvider>
            ) : (
              <div>Loading LIFF...</div> // Or a better loading indicator
            )}
          </body>
        </html>
      );
    ```
    
5. At this point we have our web app running, but we need to provide the URL to LINE so it knows where to open our mini app.
    1. Since we're just running the web app locally, we need a way to create a public URL that tunnels to our localhost URL. We can use a tool like ngrok for this.
        1. Install [ngrok](https://ngrok.com/?ref=blog.thirdweb.com) (If you don't have it installed already)
        2. In a new terminal window, run:`ngrok http http://localhost:<port number>`
        3. Copy the forwarding address provided (e.g. [`https://1a2b-3c4d-5e6f-7g8h-9i0j.ngrok.io`](https://1a2b-3c4d-5e6f-7g8h-9i0j.ngrok.io/?ref=blog.thirdweb.com))
        4. Head back to the LINE developer console and provide this address as the `Endpoint URL` in the Developing section
        
        

# Step 4: Install and setup thirdweb

Now that we have our mini app setup, let's start building our app with thirdweb so we can connect a wallet and interact with contracts onchain.

1. In your project install thirdweb

```jsx
npm install thirdweb 
or
yard add thirdweb 
```

2. Create a `.env` file in the root directory and add your `process.env.NEXT_PUBLIC_TEMPLATE_CLIENT_ID` (Provide a thirdweb client ID. Don't have one, learn how to create one [here](https://blog.thirdweb.com/guides/create-a-thirdweb-account/).)
3. Add your `NEXT_PUBLIC_TEMPLATE_LINE_LIFF` in your `.env` file as well

## **Step 5: Add a Connect Wallet Button**

Let's add a connect wallet button using the `ConnectButton` component from thirdweb. We'll configure it to only allow users to connect with email and connect a Smart Wallet (Account Abstraction) so user doesn't have to pay for gas and we can sponsor it with a paymaster.

1. Create a components folder and file for your game. Example in repo in a RockPaperScissors game.
2. In the game file add the ConnectButton component. Provide it your client, configure the wallet to only email with In-App wallets, and configure accountAbstraction to allow sponsorGas:

```jsx
<ConnectButton
    client={client}
    accountAbstraction={{
        chain: <YOUR SELECTED CHAIN>,
        sponsorGas: true
    }}
    wallets={[
        inAppWallet({
            auth: {
                options:[ "email" ]
            }
        })
    ]}
/>
```

Now when a user clicks the connect button in our mini app, they'll be prompted to enter their email to sign in. thirdweb will generate a wallet for them and use that as an EOA wallet to a Smart Wallet.

# **Step 6: Create the Game Component**

Next, let's build out our game that we want to show our user once they have signed in and connected a wallet.

1. Build your own game in the game component file we created above or you can copy the Rock, Paper, Scissors game we created here:

https://github.com/thirdweb-example/LINE-Mini-App

The next step is to create the token contract that will allow us to mint tokens to the user's wallet when they win.

## **Step 7: Create the Token Contract**

Now that we have our game set up to claim tokens, we need to create the token contract that will mint the tokens to the user's wallet.

1. Go to the thirdweb dashboard , then to the "Contracts" tab, and click "Deploy Contract" in the top right corner.
2. Choose the "Token Drop" contract, which is a claimable ERC20 token contract.

[thirdweb: The complete web3 development platform](https://thirdweb.com/thirdweb.eth/DropERC20?ref=blog.thirdweb.com)

3. Give your token a name (e.g. "Rock Paper Scissors Token"), symbol (e.g. "RPS"), and optional description and image.
4. Scroll down and click "Deploy Now", confirm the gas, and sign the request to add the contract to your dashboard.
5. Once deployed, click "View Contract" to go to the contract dashboard.
6. Go to the "Claim Conditions" tab and set up a public claim where anyone can claim any amount of tokens.

<aside>
💡

Depending how you setup your claim condition, anyone can go directly to the contract and interact with it. For this guide we will be setting the claim condition to "public" allowing anyone at any time to claim.

</aside>

## **Step 8: Interact with the Token Contract in the App**

Now that our token contract is deployed, let's interact with it in our app to allow users to claim tokens when they win.

1. In your game component let's first get our token contract we just deployed:

```tsx
const contract = getContract({
  client: client,
  chain: <YOUR_CHAIN>,
  address: "<YOUR_TOKEN_CONTRACT_ADDRESS OR pull from .env file>"
});
```

2. Next we can create a `TransactionButton` to show when a user is allowed to claim a prize. This will execute the `claimTo` function from the contract and claim tokens to the user's wallet

```tsx
<TransactionButton
  transaction={() => claimTo({
      contract: contract,
      to: account.address,
      quantity: "10"
  })}
  onTransactionConfirmed={() => {
      alert('Prize claimed!')
  }}
>Claim Prize</TransactionButton>
```

## **Step 10: Display Token Balance**

The final step is to display the user's token balance next to their wallet address.

1. In your game file, let's first get the balance of the token from the user's wallet:

```tsx
const { data: tokenbalance } = useReadContract(
    getBalance,
    {
        contract: contract,
        address: account?.address!
    }
)
```

2. Now we can display that balance in our game for the user to see

```tsx
<p>Balance: {tokenBalance?.displayValue}</p>
```

## **Conclusion**

And there you have it! We've built a fully functional web3 mini game as a LINE mini app using thirdweb. Users can:

1. Connect their wallet by signing in with email (no gas required with Account Abstraction)
2. Play rock paper scissors against the computer
3. Claim token prizes when they win (no gas required)
4. View their token balance and wallet address

By leveraging thirdweb's powerful SDK, we were able to easily implement wallet authentication, account abstraction for gasless transactions, and seamless interaction with our token contract.

The mini app works smoothly on both desktop and mobile versions of Telegram, providing an engaging and user-friendly experience.

Feel free to customize and expand upon this game to make it your own! You can change the game mechanics, add new features, or even create additional mini games.

I hope you found this tutorial helpful and informative. If you have any questions or need further assistance, please refer to the thirdweb documentation or reach out at thirdweb.com/support.

Happy building with thirdweb!