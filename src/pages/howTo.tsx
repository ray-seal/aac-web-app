import React from 'react'
import { useNavigate } from 'react-router-dom'

const HowToPage: React.FC = () => {
  const navigate = useNavigate()
  return (
    <main className="p-6 max-w-3xl mx-auto">
      <button onClick={() => navigate(-1)} className="mb-4 text-sm hover:underline">
        ← Back to app
      </button>
      {/* Edit from here down */}
      <h1 className="text-center">
        <b>Speakly How To</b>
      </h1>
      <div>
        <p className="text-center">
          Welcome to Speakly. The voice given to those who cannot speak for themselves.
        </p>
        <ul>
          <h1><b>Downloading the app</b></h1>
          <h2><b>Apple</b></h2>
          <li>
            <img src="images/SSappledots.jpeg" style={{ width: '25%' }} alt="Apple dots" />
            <figcaption>
              On iPhone or iPad click this symbol.
            </figcaption>
          </li>
          <li>
            <img src="images/SSappleaddtohome.jpeg" style={{ width: '25%' }} alt="Apple Add to Home" />
            <figcaption>
              Then click 'Add to Home Screen' and this will download the app.
            </figcaption>
          </li>
          <h2><b>Android</b></h2>
          <li>
            <img src="images/SSandroiddots.jpg" style={{ width: '50%' }} alt="Android dots" />
            <figcaption>
              Click the three dots in the top right corner.
            </figcaption>
          </li>
          <li>
            <img src="images/SSandroidaddtohome.jpg" style={{ width: '50%' }} alt="Android Add to Home" />
            <figcaption>
              Click 'Add to Home Screen' and this will download the app.
            </figcaption>
          </li>
          <li>
            <p className="text-center">
              <b>
                By adding the app to the home screen of your childs device it will download and no longer give access to the rest of the internet, taking away the worry that you will need to supervise every moment.
              </b>
            </p>
          </li>
          <li>
            <img src="images/SShome.jpeg" style={{ width: '25%' }} alt="Home Page" />
            <figcaption>
              On the homepage select the image you want to say and it will be added to the communication
              panel at the top of the screen.
            </figcaption>
            <img src="images/SSspeak.jpeg" style={{ width: '25%' }} alt="Speak Feature" />
            <figcaption>
              Press "speak" after adding to the communication panel to say your request out loud.
            </figcaption>
          </li>
          <li>
            <img src="images/SSparent.jpeg" style={{ width: '25%' }} alt="Parent Tab" />
            <figcaption>
              Click the parent tab in the top right corner to create a free account.
            </figcaption>
          </li>
          <li>
            <img src="images/SSsignup.jpeg" style={{ width: '25%' }} alt="Sign Up" />
            <figcaption>
              Simply type in your email address and choose a password to be taken to the set pin page.
            </figcaption>
          </li>
          <li>
            <img src="images/SSsetpin.png" style={{ width: '25%' }} alt="Set Pin" />
            <figcaption>
              Here you can choose your pin number, you will need to keep this safe so you can access the parent tab in future.
            </figcaption>
          </li>
          <li>
            <img src="images/SSupload.jpeg" style={{ width: '25%' }} alt="Upload" />
            <figcaption>
              Once you have created an account you can upload your own images to use. Whatever you type in the 'label' box is what will be said when 'speak' button is pressed.
            </figcaption>
          </li>
          <li>
            <img src="images/IMG_4978.jpeg" style={{ width: '25%' }} alt="Add to Favourites" />
            <figcaption>
              In your parent tab you can use the buttons at the top to decide which tabs to see on the home page.
              Use the "Home" and "School" check boxes next to each symbol to put them in the desired tab.
            </figcaption>
            <br />
            <br />
            <p>
              Now your main screen should load automatically to your selected symbols and you are ready to start using the app.
            </p>
          </li>
        </ul>
        <footer className="mt-8 flex justify-center">
          <a
            href="https://www.paypal.com/ncp/payment/CAHZDEDTMYPPY"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded shadow"
            style={{ textDecoration: 'none' }}
          >
            Donate To Creator
          </a>
        </footer>
      </div>
    </main>
  )
}

export default HowToPage
