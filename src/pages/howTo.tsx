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
      <h1 text-align: center;>
        <b>Speakly How To</b>
      </h1>
      <div>
        <p text-align: center;>
          Welcome to Speakly. The voice given to those who cannot speak for themselves.
        </p>
        <ul>
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
							<figcaption>Click the parent tab in the top right corner to create a free account.
							</figcaption>
</li>
<li>
<img src="images/SSsignup.jpeg" style={{ width: '25%' }} alt="Sign Up" />
<figcaption>
Simply type in your email address and choose a password to be taken to.
</figcaption></li>
<li>
<img src="images/SSsetpin.png" style={{ width: '25%' }} alt="Set Pin" />
<figcaption>
Here you can choose your pin number, you will need to keep this safe so you can access the parent tab in future.
</figcaption>
</li>

        </ul>
      </div>
    </main>
  )
}

export default HowToPage
