/*
 * Roadhouse
 * for Imagine Cup 2013, Windows Phone Challenge.
 * - A. D. Sandaruwan Silva
 * - "Black Magic"
 * - Sri Lanka
 *
 */

using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Animation;
using System.Windows.Shapes;
using Microsoft.Phone.Controls;
using System.IO;
using System.Windows.Media.Imaging;
using System.Windows.Resources;
using WPCordovaClassLib;
using Microsoft.Phone.Shell;
using System.IO.IsolatedStorage;
using Microsoft.Phone.Notification;
using System.Text;


namespace Roadhouse
{
    public partial class MainPage : PhoneApplicationPage
    {

        string pushUrl = "";

        public MainPage()
        {
            InitializeComponent();
            this.PGView.Loaded += GapBrowser_Loaded;

            ApplicationBar = new ApplicationBar();
            ApplicationBar.Mode = ApplicationBarMode.Default;
            ApplicationBar.Opacity = 1.0;
            ApplicationBar.IsVisible = true;
            ApplicationBar.IsMenuEnabled = true;
            ApplicationBar.BackgroundColor = Color.FromArgb(255, 233, 0, 0); 
            ApplicationBarIconButton button1 = new ApplicationBarIconButton();
            button1.IconUri = new Uri("/Images/Home.png", UriKind.Relative);
            button1.Text = "Home";

            ApplicationBarIconButton button2 = new ApplicationBarIconButton();
            button2.IconUri = new Uri("/Images/Friends.png", UriKind.Relative);
            button2.Text = "Friends";

            ApplicationBarIconButton button3 = new ApplicationBarIconButton();
            button3.IconUri = new Uri("/Images/Write.png", UriKind.Relative);
            button3.Text = "Write";

            ApplicationBarIconButton button4 = new ApplicationBarIconButton();
            button4.IconUri = new Uri("/Images/Camera.png", UriKind.Relative);
            button4.Text = "Camera";


            ApplicationBar.Buttons.Add(button1);
            ApplicationBar.Buttons.Add(button2);
            ApplicationBar.Buttons.Add(button3);
            ApplicationBar.Buttons.Add(button4);

            button1.Click += new EventHandler(btnHome_Click);
            button2.Click += new EventHandler(btnFriends_Click);
            button3.Click += new EventHandler(btnWrite_Click);
            button4.Click += new EventHandler(btnCamera_Click);

            initializePushServices();
            
        }

        private void btnHome_Click(object sender, EventArgs e)
        {
            this.PGView.Browser.InvokeScript("page_show_dialog", "page1");
        }

        private void btnFriends_Click(object sender, EventArgs e)
        {
            this.PGView.Browser.InvokeScript("page_show_dialog", "friends");
        }

        private void btnWrite_Click(object sender, EventArgs e)
        {
            this.PGView.Browser.InvokeScript("page_show_dialog", "newpost");
        }

        private void btnCamera_Click(object sender, EventArgs e)
        {
            this.PGView.Browser.InvokeScript("page_show_dialog", "camera1");
        }

        private void GapBrowser_Loaded(object sender, RoutedEventArgs e)
        {
            this.PGView.Browser.Background = new SolidColorBrush(Colors.Black);
            this.PGView.Browser.Foreground = new SolidColorBrush(Colors.Black);

            this.PGView.Loaded -= GapBrowser_Loaded;
            Storyboard _storyBoard = new Storyboard();
            DoubleAnimation animation = new DoubleAnimation()
            {
                From = 0,
                Duration = TimeSpan.FromSeconds(0.6),
                To = 90
            };
            Storyboard.SetTarget(animation, SplashProjector);
            Storyboard.SetTargetProperty(animation, new PropertyPath("RotationY"));
            _storyBoard.Children.Add(animation);
            _storyBoard.Begin();
            _storyBoard.Completed += Splash_Completed;

            CreateTiles();
        }

        void Splash_Completed(object sender, EventArgs e)
        {
            (sender as Storyboard).Completed -= Splash_Completed;
            LayoutRoot.Children.Remove(SplashImage);
        }

        private string browser_load_settings()
        {
            string sv = "";

            IsolatedStorageSettings.ApplicationSettings.TryGetValue<string>("roadhouse_st", out sv);
            return sv;
        }

        void browser_save_settings(string val)
        {
            IsolatedStorageSettings.ApplicationSettings.Remove("roadhouse_st");
            IsolatedStorageSettings.ApplicationSettings.Add("roadhouse_st", val);
        }

        void ShowNotification(string msg)
        {
            //this.PGView.Browser.InvokeScript("notifications_addstr", msg);
        }

        void SendPushURL(string msg)
        {
            pushUrl = msg;
        }

        void initializePushServices()
        {
            HttpNotificationChannel pushChannel;
            string channelName = "RoadhouseAppWPToast";

            pushChannel = HttpNotificationChannel.Find(channelName);

            if (pushChannel == null)
            {
                pushChannel = new HttpNotificationChannel(channelName);

                // Register for all the events before attempting to open the channel.
                pushChannel.ChannelUriUpdated += new EventHandler<NotificationChannelUriEventArgs>(PushChannel_ChannelUriUpdated);
                pushChannel.ErrorOccurred += new EventHandler<NotificationChannelErrorEventArgs>(PushChannel_ErrorOccurred);

                // Register for this notification only if you need to receive the notifications while your application is running.
                pushChannel.ShellToastNotificationReceived += new EventHandler<NotificationEventArgs>(PushChannel_ShellToastNotificationReceived);

                pushChannel.Open();

                // Bind this new channel for toast events.
                pushChannel.BindToShellToast();

            }else{
                // The channel was already open, so just register for all the events.
                pushChannel.ChannelUriUpdated += new EventHandler<NotificationChannelUriEventArgs>(PushChannel_ChannelUriUpdated);
                pushChannel.ErrorOccurred += new EventHandler<NotificationChannelErrorEventArgs>(PushChannel_ErrorOccurred);

                // Register for this notification only if you need to receive the notifications while your application is running.
                pushChannel.ShellToastNotificationReceived += new EventHandler<NotificationEventArgs>(PushChannel_ShellToastNotificationReceived);

                // Display the URI for testing purposes. Normally, the URI would be passed back to your web service at this point.
                //System.Diagnostics.Debug.WriteLine(pushChannel.ChannelUri.ToString());

                if(pushChannel.ChannelUri != null)
                    SendPushURL(pushChannel.ChannelUri.ToString());

            }
        }

        void PushChannel_ChannelUriUpdated(object sender, NotificationChannelUriEventArgs e)
        {
            Dispatcher.BeginInvoke(() =>
            {
                if (e.ChannelUri != null)
                    SendPushURL(e.ChannelUri.ToString());

            });
        }

        void PushChannel_ErrorOccurred(object sender, NotificationChannelErrorEventArgs e)
        {

        }

        /// <summary>
        /// Event handler for when a toast notification arrives while your application is running.  
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        void PushChannel_ShellToastNotificationReceived(object sender, NotificationEventArgs e)
        {
            StringBuilder message = new StringBuilder();
            string relativeUri = string.Empty;

            message.AppendFormat("Received Toast {0}:\n", DateTime.Now.ToShortTimeString());

            // Parse out the information that was part of the message.
            foreach (string key in e.Collection.Keys)
            {
                message.AppendFormat("{0}: {1}\n", key, e.Collection[key]);

                if (string.Compare(
                    key,
                    "wp:Param",
                    System.Globalization.CultureInfo.InvariantCulture,
                    System.Globalization.CompareOptions.IgnoreCase) == 0)
                {
                    relativeUri = e.Collection[key];
                }
            }

            // Display a dialog of all the fields in the toast.
            Dispatcher.BeginInvoke(() => ShowNotification(message.ToString()));

        }


        bool _isNewPageInstance = false;

        protected override void OnNavigatedFrom(System.Windows.Navigation.NavigationEventArgs e)
        {
            // If this is a back navigation, the page will be discarded, so there
            // is no need to save state.
            if (e.NavigationMode != System.Windows.Navigation.NavigationMode.Back)
            {
                // Save the ViewModel variable in the page's State dictionary.
                //State["ViewModel"] = _viewModel;
            }
        }

        protected override void OnNavigatedTo(System.Windows.Navigation.NavigationEventArgs e)
        {
            // If _isNewPageInstance is true, the page constuctor has been called, so
            // state may need to be restored
            if (_isNewPageInstance)
            {

            }

            // Set _isNewPageInstance to false. If the user navigates back to this page
            // and it has remained in memory, this value will continue to be false.
            _isNewPageInstance = false;
           

        }

        // live tiles

        void SetTileCount(int ct)
        {
            ShellTile TileToFind = ShellTile.ActiveTiles.FirstOrDefault(x => x.NavigationUri.ToString().Contains("roadhousest"));

            if (TileToFind != null)
            {
                
                StandardTileData NewTileData = new StandardTileData
                {
                    Count = ct
                };

                TileToFind.Update(NewTileData);
            }
        }

        public void SetTileMsgs(string m1)
        {
            ShellTile TileToFind = ShellTile.ActiveTiles.FirstOrDefault(x => x.NavigationUri.ToString().Contains("roadhousest"));

            if (TileToFind != null)
            {

                StandardTileData NewTileData = new StandardTileData
                {
                    BackContent = m1,
                };

                TileToFind.Update(NewTileData);
            }
        }

        void CreateTiles()
        {
            /*ShellTile TileToFind = ShellTile.ActiveTiles.FirstOrDefault(x => x.NavigationUri.ToString().Contains("DefaultTitle=FromTile"));

            // Create the tile if we didn't find it already exists.
            if (TileToFind != null) TileToFind.Delete();

            {
                // Create the tile object and set some initial properties for the tile.
                // The Count value of 12 will show the number 12 on the front of the Tile. Valid values are 1-99.
                // A Count value of 0 will indicate that the Count should not be displayed.
                StandardTileData NewTileData = new StandardTileData
                {
                    BackgroundImage = new Uri("Images/Red.jpg", UriKind.Relative),
                    Title = "Roadhouse",
                    Count = 0,
                    BackTitle = "",
                    BackContent = "Welcome to Roadhouse",
                    BackBackgroundImage = new Uri("Images/Blue.jpg", UriKind.Relative)
                };

                // Create the tile and pin it to Start. This will cause a navigation to Start and a deactivation of our application.
                ShellTile.Create(new Uri("/MainPage.xaml", UriKind.Relative), NewTileData);
            }*/

            ShellTile foundTile = ShellTile.ActiveTiles.FirstOrDefault(x => x.NavigationUri.ToString().Contains("roadhousest"));

            if (foundTile == null)
            {
                StandardTileData secondaryTile = new StandardTileData
                {
                    BackgroundImage = new Uri("ApplicationIcon.png", UriKind.Relative),
                    Title = "Roadhouse",
                    Count = 0,
                    BackTitle = "",
                    BackContent = "Welcome to Roadhouse",
                    BackBackgroundImage = new Uri("Images/Blue.jpg", UriKind.Relative)
                };

                PhoneApplicationPage currentPage;
                Deployment.Current.Dispatcher.BeginInvoke(() =>
                {
                    currentPage = ((PhoneApplicationFrame)Application.Current.RootVisual).Content as PhoneApplicationPage;
                    string currentUri = currentPage.NavigationService.Source.ToString().Split('?')[0];
                    ShellTile.Create(new Uri(currentUri + "?Uri=roadhousest", UriKind.Relative), secondaryTile);
                });
            }
        }



    }
}
