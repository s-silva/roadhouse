using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Navigation;
using Microsoft.Phone.Controls;
using Microsoft.Phone.Shell;
using Roadhouse_App.Resources;
using System.Windows.Media;

namespace Roadhouse_App
{
    public partial class MainPage : PhoneApplicationPage
    {
        ApplicationBarIconButton btnCamera;
        ApplicationBarIconButton btnCrop;
        ApplicationBarIconButton btnHelp;

        // Constructor
        public MainPage()
        {
            InitializeComponent();

            // Set the data context of the listbox control to the sample data
            DataContext = App.ViewModel;

            InitializeComponent();

            SupportedOrientations = SupportedPageOrientation.Portrait | SupportedPageOrientation.Landscape;

            //Creates an application bar and then sets visibility and menu properties.
            ApplicationBar = new ApplicationBar();
            ApplicationBar.IsVisible = true;
            ApplicationBar.BackgroundColor = (Color)Color.FromArgb(255, 214, 0, 0);


            //This code creates the application bar icon buttons.
            btnCamera = new ApplicationBarIconButton(new Uri("/Icons/appbar.feature.camera.rest.png", UriKind.Relative));
            btnCrop = new ApplicationBarIconButton(new Uri("/Icons/appbar.edit.rest.png", UriKind.Relative));
            btnHelp = new ApplicationBarIconButton(new Uri("/Icons/appbar.questionmark.rest.png", UriKind.Relative));

            //Labels for the application bar buttons.
            btnCamera.Text = "Camera";
            btnCrop.Text = "Crop";
            btnHelp.Text = "Help";

            //This code will create event handlers for buttons.
            //btnCamera.Click += new EventHandler(btnCamera_Click);
            //btnCrop.Click += new EventHandler(btnCrop_Click);
            //btnHelp.Click += new EventHandler(btnHelp_Click);
            //
            //This code adds buttons to application bar.
            ApplicationBar.Buttons.Add(btnCamera);
            ApplicationBar.Buttons.Add(btnCrop);
            ApplicationBar.Buttons.Add(btnHelp);

            // Sample code to localize the ApplicationBar
            //BuildLocalizedApplicationBar();
        }

        // Load data for the ViewModel Items
        protected override void OnNavigatedTo(NavigationEventArgs e)
        {
            if (!App.ViewModel.IsDataLoaded)
            {
                App.ViewModel.LoadData();
            }
        }

        // Sample code for building a localized ApplicationBar
        //private void BuildLocalizedApplicationBar()
        //{
        //    // Set the page's ApplicationBar to a new instance of ApplicationBar.
        //    ApplicationBar = new ApplicationBar();

        //    // Create a new button and set the text value to the localized string from AppResources.
        //    ApplicationBarIconButton appBarButton = new ApplicationBarIconButton(new Uri("/Assets/AppBar/appbar.add.rest.png", UriKind.Relative));
        //    appBarButton.Text = AppResources.AppBarButtonText;
        //    ApplicationBar.Buttons.Add(appBarButton);

        //    // Create a new menu item with the localized string from AppResources.
        //    ApplicationBarMenuItem appBarMenuItem = new ApplicationBarMenuItem(AppResources.AppBarMenuItemText);
        //    ApplicationBar.MenuItems.Add(appBarMenuItem);
        //}
    }
}